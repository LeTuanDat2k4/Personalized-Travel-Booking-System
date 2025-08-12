package com.datltdev.TravelBookinng.service.custom;

import com.datltdev.TravelBookinng.exception.MyException;
import com.datltdev.TravelBookinng.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            return userRepository.findByEmail(username).orElseThrow(() -> new MyException("Username/Email not Found"));
        } catch (MyException e) {
            throw new RuntimeException(e);
        }
    }
}
