package com.datltdev.TravelBookinng.untils;

import com.datltdev.TravelBookinng.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTUtils {
    private static final Long EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7L; // for 7 days
    private final SecretKey Key;

    public JWTUtils() {
        String secretString = "85d5b2704f91e0fc31ba788f43c21f079cb35d1ac37159661569ee45162640fb9f37fad12e42116530d72b1210e0f98b8304c4b280b41e09f0a7f9150187dba84eb899efb4c028d3fc53269c6dcd90c06a72179f15bdd4a62b92a83d27533fb789012199cfba4db53db7aabbd311313b89fa087db1a21503b5e8f30495bafe158660a4427b1b7f13e129521a986df8cd43faefb7dc4e36158efbf771a582018f211f141bc74bf557b8b54c628a59762e94daa45a4bbb9a2fd5cc1606c75915b283d12376626a73241e8ab9b555f78bb43daa83003074f920b13e9aea63ebb36b621de17a2a1bebcb51c6ac8ab7d04ad26b37b6f897be2e8864a12d59b46f624a";
        byte[] keyBytes = Base64.getDecoder().decode(secretString.getBytes(StandardCharsets.UTF_8));
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public String generateToken(UserEntity userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = this.extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenExpired(String token) {
        Date expirationDate = this.extractClaims(token, Claims::getExpiration);
        return expirationDate.before(new Date());
    }

    public boolean validateToken(String token, UserEntity userDetails) {
        final String username = this.extractUsername(token);
        return (username.equals(userDetails.getEmail()) && !isTokenExpired(token));
    }

}
