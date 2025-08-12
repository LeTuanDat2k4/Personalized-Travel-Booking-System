package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.model.dto.UserDTO;
import com.datltdev.TravelBookinng.model.request.LoginRequest;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;

public interface UserService {
    ResponseDTO register(UserDTO user);

    ResponseDTO login(LoginRequest loginRequest);

    ResponseDTO getAllUsers();

    ResponseDTO getUserBookingHistory(String userId);

    ResponseDTO deleteUser(String userId);

    ResponseDTO getUserById(String userId);

    ResponseDTO getMyInfo();
}
