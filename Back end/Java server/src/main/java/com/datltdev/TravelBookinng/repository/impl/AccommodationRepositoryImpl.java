package com.datltdev.TravelBookinng.repository.impl;

import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.model.request.AccommodationRequest;
import com.datltdev.TravelBookinng.repository.custom.AccommodationRepositoryCustom;
import com.datltdev.TravelBookinng.untils.DataUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

public class AccommodationRepositoryImpl  {
    @PersistenceContext
    private EntityManager entityManager;

    private void processJoinStatements(StringBuilder sql, AccommodationRequest propertyRequest) {
        LocalDate checkInDate = propertyRequest.getCheckInDate();
        LocalDate checkOutDate = propertyRequest.getCheckOutDate();
        Integer numOfAdults = propertyRequest.getNumOfAdults();
        Integer numOfChildren = propertyRequest.getNumOfChildren();

        if (DataUtils.check(checkInDate) || DataUtils.check(checkOutDate) ||
                DataUtils.check(numOfChildren) || DataUtils.check(numOfAdults)) {
            sql.append("JOIN booking bk ON bk.propertyid = property.id \n");
        }
    }


//    @Override
//    public List<Accommodation> findAvailableRoomsByDatesAndTypes(LocalDate checkInDate, LocalDate checkOutDate, String type) {
//        String SQL = "SELECT p FROM Accommodation p \n" + "LEFT JOIN Booking b ON b.accommodation.id = p.id \n" +
//                "WHERE p.type LIKE :type \n" +
//                "AND (b.id IS NULL OR (b.checkOutDate < :checkInDate OR b.checkInDate > :checkOutDate))";
//
//        Query query = entityManager.createQuery(SQL, Accommodation.class);
//        query.setParameter("type", "%" + type + "%");
//        query.setParameter("checkInDate", checkInDate);
//        query.setParameter("checkOutDate", checkOutDate);
//
//        return query.getResultList();
//    }
}
