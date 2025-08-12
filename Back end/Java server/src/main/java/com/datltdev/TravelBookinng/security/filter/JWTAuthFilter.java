package com.datltdev.TravelBookinng.security.filter;

import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.service.custom.CustomUserDetailsService;
import com.datltdev.TravelBookinng.untils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {
    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            if (isBypassToken(request) || request.getServletPath().startsWith("/properties")) {
                filterChain.doFilter(request, response);
                return;
            }
            final String authHeader = request.getHeader("Authorization");
            final String jwtToken;
            final String userEmail;

            if (authHeader == null || authHeader.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }
            jwtToken = authHeader.replace("Bearer ", "");
            userEmail = jwtUtils.extractUsername(jwtToken);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserEntity userDetails = (UserEntity) customUserDetailsService.loadUserByUsername(userEmail);
                if (jwtUtils.validateToken(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        }
    }

    private boolean isBypassToken(@NonNull HttpServletRequest request) {
        final List<Pair<String, String>> bypassTokens = Arrays.asList(
                Pair.of("/auth/register", "POST"),
                Pair.of("/auth/login", "POST"),
                Pair.of("/properties", "GET"),
                Pair.of("/properties", "POST"),
                Pair.of("/properties", "PUT"),
                Pair.of("/properties", "DELETE")
        );
        String path = request.getServletPath();
        String method = request.getMethod();
        for (Pair<String, String> bypassToken : bypassTokens) {
            if (path.startsWith(bypassToken.getFirst()) && method.equals(bypassToken.getSecond())) {
                return true;
            }
        }
        return false;
    }
}
