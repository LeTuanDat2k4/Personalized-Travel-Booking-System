import axios from "axios"

export default class ApiService {
  static BASE_URL = "http://localhost:8080"
  static pendingRequests = {}

  static getHeader() {
    const token = localStorage.getItem("authToken") // Updated to use authToken
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  /**
   * Stores authentication data in browser's local storage
   * @param {Object} authResponse - The authentication response object
   * @param {string} authResponse.token - JWT token for authentication
   * @param {number} authResponse.data - User ID from the response
   * @param {string} authResponse.role - User role (ADMIN, OWNER, TRAVELER)
   * @returns {boolean} - Returns true if storage was successful, false otherwise
   */
  static storeAuthData(authResponse) {
    try {
      // Validate the response object structure
      if (!authResponse || typeof authResponse !== "object") {
        console.error("[ApiService] Invalid auth response: Response is not an object")
        return false
      }

      // Extract and validate required fields
      const { token, data: userId, role } = authResponse

      // Validate token
      if (!token || typeof token !== "string") {
        console.error("[ApiService] Invalid auth response: Token is missing or invalid")
        return false
      }

      // Validate userId (from data field)
      if (userId === undefined || userId === null) {
        console.error("[ApiService] Invalid auth response: User ID (data field) is missing")
        return false
      }

      // Validate role
      if (!role || typeof role !== "string") {
        console.error("[ApiService] Invalid auth response: Role is missing or invalid")
        return false
      }

      // Store authentication data in localStorage
      localStorage.setItem("authToken", token)
      localStorage.setItem("userId", userId.toString())
      localStorage.setItem("role", role)

      console.log("[ApiService] Authentication data stored successfully")
      console.log(`[ApiService] User ID: ${userId}, Role: ${role}`)

      return true
    } catch (error) {
      // Handle any errors that occur during storage
      console.error("[ApiService] Error storing authentication data:", error.message)

      // Clean up any partially stored data in case of error
      try {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userId")
        localStorage.removeItem("role")
      } catch (cleanupError) {
        console.error("[ApiService] Error during cleanup:", cleanupError.message)
      }

      return false
    }
  }

  /**
   * Retrieves authentication data from localStorage
   * @returns {Object|null} - Returns auth data object or null if not found/invalid
   */
  static getAuthData() {
    try {
      const token = localStorage.getItem("authToken")
      const userId = localStorage.getItem("userId")
      const role = localStorage.getItem("role")

      // Check if all required data is present
      if (!token || !userId || !role) {
        return null
      }

      return {
        token,
        userId: Number.parseInt(userId),
        role,
      }
    } catch (error) {
      console.error("[ApiService] Error retrieving authentication data:", error.message)
      return null
    }
  }

  /**
   * Clears all authentication data from localStorage
   */
  static clearAuthData() {
    try {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("role")
      console.log("[ApiService] Authentication data cleared successfully")
    } catch (error) {
      console.error("[ApiService] Error clearing authentication data:", error.message)
    }
  }

  // Helper method to deduplicate API requests
  static async deduplicateRequest(key, requestFn) {
    // If there's already a pending request with this key, return its promise
    if (this.pendingRequests[key]) {
      console.log(`[ApiService] Using pending request for ${key}`)
      return this.pendingRequests[key]
    }

    // Otherwise, create a new request and store its promise
    try {
      console.log(`[ApiService] Making new request for ${key}`)
      this.pendingRequests[key] = requestFn()
      const result = await this.pendingRequests[key]
      return result
    } finally {
      // Clean up after the request is done
      delete this.pendingRequests[key]
    }
  }

  /**AUTH */

  /* This register a new user */
  static async registerUser(registration) {
    const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
    return response.data
  }

  /* This login a registered user */
  static async loginUser(loginDetails) {
    const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
    if (response.data.statusCode === 200) {
      // Use the new storage function instead of manual localStorage calls
      const storageSuccess = this.storeAuthData(response.data)

      if (!storageSuccess) {
        console.error("[ApiService] Failed to store authentication data")
      }
    }
    return response.data
  }

  /***USERS */

  /* This is to get the user profile */
  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users/all`, {
      headers: this.getHeader(),
    })
    return response.data
  }

  static async getUserProfile() {
    const response = await axios.get(`${this.BASE_URL}/users/get-logged-in-profile-info`, {
      headers: this.getHeader(),
    })
    return response.data
  }

  /* This is to get a single user */
  static async getUser(userId) {
    const response = await axios.get(`${this.BASE_URL}/users/get-by-id/${userId}`, {
      headers: this.getHeader(),
    })
    return response.data
  }

  /* This is to get user bookings by the user id */
  static async getUserBookings(userId) {
    const response = await axios.get(`${this.BASE_URL}/users/get-user-bookings/${userId}`, {
      headers: this.getHeader(),
    })
    return response.data
  }

  /* This is to delete a user */
  static async deleteUser(userId) {
    const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
      headers: this.getHeader(),
    })
    return response.data
  }

  /**ROOM */
  /* This adds a new room to the database */
  static async addProperty(formData) {
    const result = await axios.post(`${this.BASE_URL}/properties/add`, formData, {
      headers: {
        ...this.getHeader(),
        "Content-Type": "multipart/form-data",
      },
    })
    return result.data
  }

  /* This gets all available rooms */
  static async getAllAvailableProperties() {
    const result = await axios.get(`${this.BASE_URL}/properties/all-available-properties`)
    return result.data
  }

  /* This gets all available by dates rooms from the database with a given date and a room type */
  static async getAvailablePropertiesByDateAndType(checkInDate, checkOutDate, roomType) {
    const result = await axios.get(
      `${this.BASE_URL}/properties/available-properties-by-date-and-type?checkInDate=${checkInDate}
            &checkOutDate=${checkOutDate}&roomType=${roomType}`,
    )
    return result.data
  }

  /* This gets all room types from the database */
  static async getPropertyTypes() {
    const response = await axios.get(`${this.BASE_URL}/properties/types`)
    return response.data
  }

  /* This gets all rooms from the database */
  static async getAllProperties() {
    const result = await axios.get(`${this.BASE_URL}/properties/all`)
    return result.data
  }

  /* This function gets a room by the id */
  static async getPropertyById(roomId) {
    const result = await axios.get(`${this.BASE_URL}/properties/property-by-id/${roomId}`)
    return result.data
  }

  /* This deletes a room by the Id */
  static async deleteProperty(roomId) {
    const result = await axios.delete(`${this.BASE_URL}/properties/delete/${roomId}`, {
      headers: this.getHeader(),
    })
    return result.data
  }

  /* This updates a room */
  static async updateProperty(roomId, formData) {
    const result = await axios.put(`${this.BASE_URL}/properties/update/${roomId}`, formData, {
      headers: {
        ...this.getHeader(),
        "Content-Type": "multipart/form-data",
      },
    })
    return result.data
  }

  /**Recommendation */
  static async getRecommendations(limit = 10) {
    const result = await axios.get(`${this.BASE_URL}/recommendations?limit=${limit}`, {
      headers: this.getHeader(),
    })
    return result.data
  }

  static async getNewUserRecommendations(userFeatures, limit = 10) {
    // Create a deep copy of the user features to avoid modifying the original
    const processedFeatures = JSON.parse(JSON.stringify(userFeatures))

    // Map common location names to their Vietnamese equivalents
    const locationMap = {
      Hanoi: "Hà Nội",
      "Ho Chi Minh City": "Hồ Chí Minh",
      "Da Nang": "Đà Nẵng",
    }

    // Map amenity shorthand to their full names as used in the API
    const amenityMap = {
      ac: "air conditioning",
      wifi: "wi-fi",
      pool: "bể bơi",
      kitchen: "bếp",
      washer: "máy giặt",
      elevator: "thang máy",
    }

    // Update location if it's in our mapping
    if (processedFeatures.location_pref_str && locationMap[processedFeatures.location_pref_str]) {
      processedFeatures.location_pref_str = locationMap[processedFeatures.location_pref_str]
    }

    // Update amenities if they exist
    if (processedFeatures.amenities_pref && Array.isArray(processedFeatures.amenities_pref)) {
      processedFeatures.amenities_pref = processedFeatures.amenities_pref.map(
        (amenity) => amenityMap[amenity] || amenity,
      )
    }

    console.log("Sending processed features to API:", processedFeatures)

    const result = await axios.post(
      `${this.BASE_URL}/recommendations/new?limit=${limit}`,
      { user_features: processedFeatures },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    return result.data
  }

  /**BOOKING */
  /* This saves a new booking to the database */
  static async bookProperty(roomId, userId, booking) {
    console.log("USER ID IS: " + userId)
    const response = await axios.post(`${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`, booking, {
      headers: this.getHeader(),
    })
    return response.data
  }

  /* This gets all bookings from the database */
  static async getAllBookings() {
    const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
      headers: this.getHeader(),
    })
    return result.data
  }

  /* This get booking by the confirmation code */
  static async getBookingByConfirmationCode(bookingCode) {
    const result = await axios.get(`${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`)
    return result.data
  }

  /* This is to cancel user booking */
  static async cancelBooking(bookingId) {
    const result = await axios.delete(`${this.BASE_URL}/bookings/cancel/${bookingId}`, {
      headers: this.getHeader(),
    })
    return result.data
  }

  /**REVIEWS */
  /* This gets reviews for a specific accommodation */
  static async getAccommodationReviews(accommodationId) {
    try {
      const result = await axios.get(`${this.BASE_URL}/reviews/accommodation/${accommodationId}`)
      return result.data
    } catch (error) {
      console.error("Error fetching accommodation reviews:", error)
      throw error
    }
  }

  /* This gets review summary for a specific accommodation */
  static async getReviewSummary(accommodationId) {
    try {
      const result = await axios.get(`${this.BASE_URL}/reviews/summary/${accommodationId}`)
      return result.data
    } catch (error) {
      console.error("Error fetching review summary:", error)
      throw error
    }
  }

  /* This gets reviews by a specific user */
  static async getUserReviews(userId) {
    try {
      const result = await axios.get(`${this.BASE_URL}/reviews/user/${userId}`, {
        headers: this.getHeader(),
      })
      return result.data
    } catch (error) {
      console.error("Error fetching user reviews:", error)
      throw error
    }
  }

  /* This creates a new review for an accommodation */
  static async createReview(accommodationId, reviewData) {
    try {
      const result = await axios.post(`${this.BASE_URL}/reviews/accommodation/${accommodationId}`, reviewData, {
        headers: this.getHeader(),
      })
      return result.data
    } catch (error) {
      console.error("Error creating review:", error)
      throw error
    }
  }

  /* This updates an existing review */
  static async updateReview(reviewId, reviewData) {
    try {
      const result = await axios.put(`${this.BASE_URL}/reviews/${reviewId}`, reviewData, {
        headers: this.getHeader(),
      })
      return result.data
    } catch (error) {
      console.error("Error updating review:", error)
      throw error
    }
  }

  /* This deletes a review */
  static async deleteReview(reviewId) {
    try {
      const result = await axios.delete(`${this.BASE_URL}/reviews/${reviewId}`, {
        headers: this.getHeader(),
      })
      return result.data
    } catch (error) {
      console.error("Error deleting review:", error)
      throw error
    }
  }

  /**WISHLIST */
  /* This gets the user's wishlist */
  static async getWishlist() {
    try {
      return await this.deduplicateRequest("getWishlist", async () => {
        const result = await axios.get(`${this.BASE_URL}/wishlist`, {
          headers: this.getHeader(),
        })
        return result.data
      })
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      throw error
    }
  }

  /* This adds an accommodation to the wishlist */
  static async addToWishlist(accommodationId) {
    try {
      const result = await axios.post(
        `${this.BASE_URL}/wishlist/accommodation/${accommodationId}`,
        {},
        {
          headers: this.getHeader(),
        },
      )
      return result.data
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  /* This removes an accommodation from the wishlist */
  static async removeFromWishlist(accommodationId) {
    try {
      const result = await axios.delete(`${this.BASE_URL}/wishlist/accommodation/${accommodationId}`, {
        headers: this.getHeader(),
      })
      return result.data
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  /* This checks if an accommodation is in the wishlist */
  static async isInWishlist(accommodationId) {
    try {
      const wishlistResponse = await this.getWishlist()
      if (wishlistResponse.statusCode === 200 && wishlistResponse.data) {
        return wishlistResponse.data.some(
          (item) => item.accommodation.accommodationId.toString() === accommodationId.toString(),
        )
      }
      return false
    } catch (error) {
      console.error("Error checking wishlist:", error)
      return false
    }
  }

  /**SEARCH */
  /* This searches for properties based on location, dates, and types */
  static async searchProperties(searchParams) {
    try {
      const { location, checkIn, checkOut, types } = searchParams
      // Build query parameters
      const queryParams = new URLSearchParams()
      if (location) queryParams.append("searchLocation", location)
      if (checkIn) queryParams.append("checkInDate", checkIn)
      if (checkOut) queryParams.append("checkOutDate", checkOut)
      if (types && types.length > 0) {
        types.forEach((type) => queryParams.append("types", type))
      }

      // Add authentication headers to the request
      const response = await axios.get(`${this.BASE_URL}/recommendations/search?${queryParams.toString()}`, {
        headers: this.getHeader(),
      })
      return response.data
    } catch (error) {
      console.error("Error searching properties:", error)
      throw error
    }
  }

  /**AUTHENTICATION CHECKER */
  static getCurrentUserId() {
    const userId = localStorage.getItem("userId")
    return userId ? Number.parseInt(userId) : null
  }

  static logout() {
    this.clearAuthData() // Use the new clearAuthData method
  }

  static isAuthenticated() {
    const token = localStorage.getItem("authToken") // Updated to use authToken
    return !!token
  }

  static isAdmin() {
    const role = localStorage.getItem("role")
    return role === "ADMIN"
  }

  static isOwner() {
    const role = localStorage.getItem("role")
    return role === "OWNER"
  }

  static isUser() {
    const role = localStorage.getItem("role")
    return role === "TRAVELER"
  }
}
