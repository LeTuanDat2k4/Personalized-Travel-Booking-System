package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.UserService;
import com.datltdev.TravelBookinng.untils.DataUtils;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;


    @GetMapping("/all")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> getAllUsers() {
        ResponseDTO response = userService.getAllUsers();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-by-id/{userId}")
    public ResponseEntity<ResponseDTO> getUserById(@PathVariable("userId") String userId) {
        if (!DataUtils.check(userId)) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("User ID is required");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } try {
            Long.parseLong(userId);
        } catch (NumberFormatException e) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid user ID format");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = userService.getUserById(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{userId}")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> deleteUSer(@PathVariable("userId") String userId) {
        ResponseDTO response = userService.deleteUser(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-logged-in-profile-info")
    public ResponseEntity<ResponseDTO> getLoggedInUserProfile() {
        try {
            String email = SecurityUtils.getPrincipal().getUsername();
            ResponseDTO response = userService.getMyInfo();
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(401);
            response.setMessage("User not authenticated");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
    }

    @GetMapping("/get-user-bookings/{userId}")
    public ResponseEntity<ResponseDTO> getUserBookingHistory(@PathVariable("userId") String userId) {
        if (!DataUtils.check(userId)) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("User ID is required");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } try {
            Long.parseLong(userId);
        } catch (NumberFormatException e) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid user ID format");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = userService.getUserBookingHistory(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
