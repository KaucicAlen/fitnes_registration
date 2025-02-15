import { useState, useEffect } from "react";
import axios from "axios";

const Calendar = ({ token }) => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentDay = new Date().toLocaleDateString("sl-SI", { weekday: "long" });
    const [selectedDay, setSelectedDay] = useState(currentDay.charAt(0).toUpperCase() + currentDay.slice(1));
    const daysOfWeek = ["Ponedeljek", "Torek", "Sreda", "Cetrtek", "Petek", "Sobota", "Nedelja"];
    const hours = [
        "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
    ];

    // Fetch reservations when the component mounts
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get("https://fitnesregistration-production.up.railway.app/getReservations", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setReservations(response.data); // Ensure response includes { day, hour, username }
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching reservations:", err);
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, [token]);

    const handleReserve = async (day, hour) => {
        try {
            const response = await axios.post(
                "https://fitnesregistration-production.up.railway.app/reserve",
                { day, hour },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.message) {
                alert(response.data.message);
                setReservations((prevReservations) => [
                    ...prevReservations,
                    { day, hour, username: response.data.username },
                ]);
            }
        } catch (err) {
            console.error("Error reserving block:", err);
            alert(err.response?.data?.message || "Something went wrong!");
        }
    };

    const handleRemove = async (day, hour) => {
        try {
            const response = await axios.delete(
                `https://fitnesregistration-production.up.railway.app/removeReservation/${day}/${hour}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert(response.data.message);

            // Remove the reservation from state
            setReservations((prevReservations) =>
                prevReservations.filter((res) => res.day !== day || res.hour !== hour)
            );
        } catch (err) {
            console.error("Error removing reservation:", err);
            alert(err.response?.data?.message || "Something went wrong!");
        }
    };

    // Toggle the selected day (expand/collapse)
    const toggleDay = (day) => {
        setSelectedDay(selectedDay === day ? null : day); // Collapse if same day is clicked, expand if new day is clicked
    };

    return (
        <div className="calendar">
            <h2>Odprti termini</h2>
            {isLoading ? (
                <p>Nalagam Termine</p>
            ) : (
                <div className="week-grid">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="day-column">
                            <h3
                                onClick={() => toggleDay(day)} // Toggle visibility of the day
                                className={`day-header ${selectedDay === day ? "expanded" : ""}`}
                            >
                                {day}
                            </h3>

                            {/* Only display reservations for the selected day */}
                            {selectedDay === day && (
                                <div className="reservation-grid">
                                    {hours.map((hour, index) => {
                                        const reservation = reservations.find(
                                            (res) => res.day === day && res.hour === hour
                                        );
                                        const isReserved = Boolean(reservation);
                                        const reservedBy = reservation ? reservation.username : "";
                                        const loggedInUser = localStorage.getItem("username");
                                        const isUserOwner = reservation && reservedBy === loggedInUser;

                                        return (
                                            <div
                                                key={index}
                                                className={`hour-block ${isUserOwner ? "your-reservation" : isReserved ? "reserved" : "free"}`}
                                                onClick={() => {
                                                    if (!isReserved) {
                                                        handleReserve(day, hour);
                                                    } else if (isUserOwner) {
                                                        handleRemove(day, hour);
                                                    }
                                                }}
                                            >
                                                {hour}
                                                {isReserved && (
                                                    <div className="reserved-by">Reserved by: {reservedBy}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

};

export default Calendar;
