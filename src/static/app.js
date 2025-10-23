document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create main content
        const title = document.createElement("h4");
        title.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availability = document.createElement("p");
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants";

        const participantsHeader = document.createElement("h5");
        participantsHeader.textContent = "Participants";

        participantsSection.appendChild(participantsHeader);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          // helper to build initials
          const getInitials = (email) => {
            const local = (email || "").split("@")[0] || "";
            const parts = local.split(/[\.\-_]/).filter(Boolean);
            let initials = "";
            if (parts.length === 0 && local.length > 0) {
              initials = local.slice(0, 2);
            } else if (parts.length === 1) {
              initials = parts[0].slice(0, 2);
            } else {
              initials = (parts[0][0] || "") + (parts[1][0] || "");
            }
            return initials.toUpperCase().slice(0, 2);
          };

          details.participants.forEach((p) => {
            const li = document.createElement("li");

            const badge = document.createElement("span");
            badge.className = "participant-badge";
            badge.textContent = getInitials(p);

            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;

            li.appendChild(badge);
            li.appendChild(nameSpan);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const empty = document.createElement("div");
          empty.className = "no-participants";
          empty.textContent = "No participants yet — be the first to sign up!";
          participantsSection.appendChild(empty);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
