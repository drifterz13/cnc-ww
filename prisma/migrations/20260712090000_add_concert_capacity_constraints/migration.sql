ALTER TABLE "Concert" ADD CONSTRAINT "concert_total_seats_positive_check" CHECK ("totalSeats" > 0);

ALTER TABLE "Concert" ADD CONSTRAINT "concert_available_seats_range_check" CHECK ("availableSeats" >= 0 AND "availableSeats" <= "totalSeats");
