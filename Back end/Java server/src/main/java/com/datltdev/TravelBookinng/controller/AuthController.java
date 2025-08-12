package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.model.dto.UserDTO;
import com.datltdev.TravelBookinng.model.request.LoginRequest;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.UserService;
import com.datltdev.TravelBookinng.untils.DataUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody UserDTO user) {
        if (!DataUtils.check(user.getEmail()) || !DataUtils.check(user.getPassword())) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Email and password are required");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }

        ResponseDTO response = userService.register(user);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequest loginRequest) {
        if (!DataUtils.check(loginRequest.getEmail()) || !DataUtils.check(loginRequest.getPassword())) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Email and password are required");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        try {
            ResponseDTO response = userService.login(loginRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception ex) {
            ResponseDTO errorResponse = new ResponseDTO();
            errorResponse.setStatusCode(500);
            errorResponse.setMessage("An unexpected internal server error occurred.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
