package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.ConvertorService;
import com.datltdev.TravelBookinng.convertor.UserConvertor;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.exception.MyException;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import com.datltdev.TravelBookinng.model.request.LoginRequest;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.datltdev.TravelBookinng.service.UserService;
import com.datltdev.TravelBookinng.untils.JWTUtils;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserConvertor userConverter;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConvertorService convertorService;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public ResponseDTO register(UserDTO user) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            if(userRepository.existsByEmail(user.getEmail())) {
                throw new MyException("Email already exists, please choose another email!");
            }
            UserEntity userEntity = userConverter.convertToUserEntity(user);
            userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
            userEntity.setRole(user.getRole() != null ? UserEntity.Role.valueOf(user.getRole()) : UserEntity.Role.TRAVELER);
            UserEntity savedUser = userRepository.save(userEntity);
            UserDTO userDTO = userConverter.convertToUserDTO(savedUser);
            responseDTO.setStatusCode(200);
            responseDTO.setUser(userDTO);
        } catch (MyException e) {
            responseDTO.setStatusCode(400);
            responseDTO.setMessage(e.getMessage());
        } catch (Exception e) {
            responseDTO.setStatusCode(500);
            responseDTO.setMessage("Error Occurred During USer Registration " + e.getMessage());

        }
        return responseDTO;
    }

    @Override
    public ResponseDTO login(LoginRequest loginRequest) {
        ResponseDTO response = new ResponseDTO();

        try {
            Optional<UserEntity> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
            if(optionalUser.isEmpty()) {
                throw new MyException("Invalid email / password");
            }
            UserEntity user = optionalUser.get();
            if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                throw new MyException("Wrong email or password");
            }
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), loginRequest.getPassword(),
                    user.getAuthorities()
            );
            authenticationManager.authenticate(authenticationToken);

            var token = jwtUtils.generateToken(user);
            response.setStatusCode(200);
            response.setData(user.getUserId());
            response.setToken(token);
            response.setRole(String.valueOf(user.getRole()));
            response.setExpirationTime("7 Days");
            response.setMessage("successful");

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Occurred During USer Login " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getAllUsers() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<UserEntity> userList = userRepository.findAll();
            List<UserDTO> userDTOList = convertorService.mapUserListEntityToUserListDTO(userList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUserList(userDTOList);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getUserBookingHistory(String userId) {
        ResponseDTO response = new ResponseDTO();

        try {
            UserEntity user = userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new MyException("UserEntity Not Found"));
            UserDTO userDTO = convertorService.convertToUserDTOPlusBookingsAndRoom(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO deleteUser(String userId) {
        ResponseDTO response = new ResponseDTO();

        try {
            userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new MyException("UserEntity Not Found"));
            userRepository.deleteById(Long.valueOf(userId));
            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getUserById(String userId) {
        ResponseDTO response = new ResponseDTO();

        try {
            UserEntity user = userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new MyException("UserEntity Not Found"));
            UserDTO userDTO = userConverter.convertToUserDTO(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getMyInfo() {
        ResponseDTO response = new ResponseDTO();

        try {
            String email = SecurityUtils.getPrincipal().getEmail();
            UserEntity user = userRepository.findByEmail(email).orElseThrow(() -> new MyException("UserEntity Not Found"));
            UserDTO userDTO = userConverter.convertToUserDTO(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }
}
