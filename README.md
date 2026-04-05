
# UniLink Development Report

Welcome to the documentation pages of UniLink!

This Software Development Report, tailored for LEIC-ES-2025-26, provides comprehensive details about UniLink, from high-level vision to low-level implementation decisions. It’s organised by the following activities. 

* [Business modeling](#Business-Modelling) 
  * [Product Vision](#Product-Vision)
  * [Features and Assumptions](#Features-and-Assumptions)
  * [Elevator Pitch](#Elevator-pitch)
* [Requirements](#Requirements)
  * [User stories](#User-stories)
  * [Domain model](#Domain-model)
* [Architecture and Design](#Architecture-And-Design)
  * [Logical architecture](#Logical-Architecture)
  * [Physical architecture](#Physical-Architecture)
  * [Vertical prototype](#Vertical-Prototype)
* [Project management](#Project-Management)
  * [Sprint 0](#Sprint-0)
  * [Sprint 1](#Sprint-1)
  * [Sprint 2](#Sprint-2)
  * [Sprint 3](#Sprint-3)
  * [Sprint 4](#Sprint-4)
  * [Final Release](#Final-Release)
  

Contributions are expected to be made exclusively by the initial team, but we may open them to the community, after the course, in all areas and topics: requirements, technologies, development, experimentation, testing, etc.

Please contact us!

Thank you!

* António Machado up202404630@up.pt
* Diogo Caleiro up202407548@up.pt
* Gonçalo Queirós up202407377@up.pt
* José Lopes up202406360@up.pt
* José Silva up202406359@up.pt

---
## Business Modelling

Business modeling in software development involves defining the product's vision, understanding market needs, aligning features with user expectations, and setting the groundwork for strategic planning and execution.

### Product Vision

UniLink connects university students through safe, free and trusted ride-sharing, making academic mobility simpler, smarter and more social.

### Features and Assumptions

- Request and offer rides with vehicle identification (license plate and car model)
- Passengers can tip drivers
- Leaderboard system
- Only university students can register, using a university-associated email
- User profile including university, course, and academic year
- Average rating and reviews
- Badges (achievements earned as a passenger/driver)
- Google Maps integration
- Weekly streaks
- Bus schedules available when there are not enough rides
- Drivers display the number of rides given on their profile
- Schedule rides in advance
- Book/reserve rides
- Number of available seats
- "Women-only" ride option
- Messaging between driver and passenger
- Reporting system (user/ride reports)

### Elevator Pitch
<!-- 
Draft a small text to help you quickly introduce and describe your product in a short time (lift travel time ~90 seconds) and a few words (~800 characters), a technique usually known as elevator pitch.

Take a look at the following links to learn some techniques:
* [Crafting an Elevator Pitch](https://www.mindtools.com/pages/article/elevator-pitch.htm)
* [The Best Elevator Pitch Examples, Templates, and Tactics - A Guide to Writing an Unforgettable Elevator Speech, by strategypeak.com](https://strategypeak.com/elevator-pitch-examples/)
* [Top 7 Killer Elevator Pitch Examples, by toggl.com](https://blog.toggl.com/elevator-pitch-examples/)
-->

## Requirements

### User Stories

🚶 Passengers

**1. View Ride Details**
> *As a passenger, I want to view ride details so that I can evaluate safety.*

**Acceptance Criteria:**
- Driver information is displayed
- Car details are visible
- Available seats are shown
- Ride route is visible

**2. Search Rides**
> *As a passenger, I want to search rides so that I can find transport.*

**Acceptance Criteria:**
- User can search by origin and destination
- User can filter by date
- Only rides with available seats are shown
- Results are displayed in a list

**3. Reserve a Seat**
> *As a passenger, I want to reserve a seat so that I can join a ride.*

**Acceptance Criteria:**
- User can select a ride
- User can reserve a seat
- Available seats decrease after reservation
- Cannot reserve if ride is full
- Confirmation message is displayed

🚗 Drivers

**4. Create a Ride**
> *As a driver, I want to create a ride so that I can offer transportation.*

**Acceptance Criteria:**
- User can input origin and destination
- User can select date and time
- User can define number of seats
- System validates seats > 0
- Ride is created successfully
- Ride appears in search results

**5. Add Car Details**
> *As a driver, I want to add car details so that passengers can identify my vehicle.*

**Acceptance Criteria:**
- User can input license plate
- User can input car model
- Both fields are required
- Car is linked to user profile

**6. Manage Rides**
> *As a driver, I want to manage my rides so that I can edit or cancel them.*

**Acceptance Criteria:**
- Driver can edit ride details
- Driver can cancel a ride
- Changes are saved correctly
- Cancelled rides are no longer visible

👤 General Profile & Safety

**7. Create and Edit Profile**
> *As a user, I want to create and edit my profile so that others can trust me.*

**Acceptance Criteria:**
- User can edit university, course and year
- Profile data is saved successfully
- Profile is visible to other users

**8. Women-Only Rides**
> *As a female user, I want women-only rides so that I feel safer.*

**Acceptance Criteria:**
- Female driver can enable women-only option
- Only female users can reserve
- System enforces restriction


### Domain model

 <p align="center" justify="center">
  <img src="UMLDomMod.png"/>
</p>

- **University**: Academic institution associated with users and responsible for validating restricted registration.
- **User**: Registered student who may act as driver, passenger or both.
- **Car**: Vehicle registered by a driver for ride sharing.
- **Ride**: Transportation offer created by a driver.
- **Booking**: Reservation made by a passenger for a specific ride.
- **Review**: Evaluation submitted after a completed ride.
- **Chat**: Communication exchanged between users in the context of a booking.
- **Badge**: Achievement that may be earned through platform activity.
- **UserBadge**: Association between a user and a badge earned.
- **Report**: Complaint submitted by a user regarding another user or a ride.


## Architecture and Design

The **UniLink** system is organized into distinct components to ensure that the user interface, the business logic, and the data storage are well-separated. This organization makes the system easier to develop, test, and maintain as the project grows.

To document our architecture, we decomposed the system into three main parts:

* **The Frontend:** A mobile application that handles all user interactions and displays information.
* **The Backend:** A central server that processes all the rules of the carpooling system, such as managing rides and user accounts.
* **The Persistence Layer:** Responsible for safely storing all the information generated by the users.

In the following sections, we describe how these components interrelate and the specific technologies used to implement each part of the system.


### Logical architecture

<p align="center" justify="center">
  <img src="UMLlogical.png"/>
</p>


### Physical Architecture

<p align="center" justify="center">
  <img src="UMLphysical.png"/>
</p>


The physical structure of the UniLink system is organized into three main hardware nodes:

* **Mobile Device (Node):** Represents the user's smartphone.
    * **UniLink App (Artifact):** The mobile application client developed with React Native/Expo.
* **Application Server (Node):** The central server responsible for the backend logic and data.
    * **UniLink Backend (Artifact):** The server-side application running on Node.js.
    * **Internal Services:** Logical modules for Ride, User, and Gamification management.
    * **MySQL (Database):** The relational database used for persistent data storage (Schema: UniLink_DB).
* **External Services Server (Node):** Third-party servers that provide additional functionality.
    * **Google Maps API:** Used for geolocation and route visualization.
    * **Bus Schedule Service:** Integration with external public transport data.

**Connections:**
* **Mobile Device <-> Application Server:** Standard internet connection for data exchange.
* **Application Server <-> External Services:** Data exchange through external APIs.

## Vertical prototype

The vertical prototype implements the core functionality of UniLink, focusing on the main differentiating feature of the application: safe university ride-sharing with the option for women-only rides.

Implemented features:

- user registration restricted to university context  
- profile management  
- vehicle registration  
- ride creation with origin, destination, date and seats  
- women-only ride option  
- ride search with filters  
- seat reservation and cancellation  
- view created and reserved rides  

This prototype demonstrates the main value of UniLink:
allowing students to coordinate transportation easily and safely within their academic community.

The women-only ride option represents an important safety feature requested during requirements validation.

A functional APK was generated and released for testing purposes. Link for Sprint 0 vertical prototype APK: https://expo.dev/artifacts/eas/oox2WQnwTiu29LCRyGhjN4.apk

## Project management
<!--
Software project management is the art and science of planning and leading software projects, in which software projects are planned, implemented, monitored and controlled.

In the context of ESOF, we recommend each team to adopt a set of project management practices and tools capable of registering tasks, assigning tasks to team members, adding estimations to tasks, monitor tasks progress, and therefore being able to track their projects.

Common practices of managing agile software development with Scrum are: backlog management, release management, estimation, Sprint planning, Sprint development, acceptance tests, and Sprint retrospectives.

You can find below information and references related with the project management: 

* Backlog management: Product backlog and Sprint backlog in a [Github Projects board](https://github.com/orgs/FEUP-LEIC-ES-2023-24/projects/64);
* Release management: [v0](#), v1, v2, v3, ...;
* Sprint planning and retrospectives: 
  * plans: screenshots of Github Projects board at begin and end of each Sprint;
  * retrospectives: meeting notes in a document in the repository, addressing the following questions:
    * Did well: things we did well and should continue;
    * Do differently: things we should do differently and how;
    * Puzzles: things we don’t know yet if they are right or wrong… 
    * list of a few improvements to implement next Sprint;

-->

### Sprint 0

#### Sprint goal
Define the foundations of the UniLink project and implement an initial vertical prototype demonstrating the core functionality of the system.

#### Sprint planning

During Sprint 0, the team identified the main problem to address: improving student mobility through a trusted ride-sharing platform restricted to university communities.

The initial product backlog was created and organised into epics and user stories using GitHub Projects. The team prioritised features that represent the core value of the application, such as ride creation, ride search and reservation functionality.

Tasks were divided among team members and estimated in order to ensure balanced workload and incremental progress.

#### Backlog management

The backlog was refined collaboratively to ensure that Product Backlog Items:

- are clearly described  
- provide user value  
- are small enough to be implemented in a short time  
- include acceptance criteria  
- follow INVEST principles  

The backlog includes epics related to:

- ride management  
- user profiles  
- safety features  
- messaging  
- gamification  

#### Development

The team implemented a vertical prototype focusing on the main functionality of the application:

- register and authenticate users  
- create and manage vehicles  
- create rides  
- search rides with filters  
- reserve and cancel seats  
- women-only ride option  

#### Testing

Unit tests were created for utility functions and filtering logic.

Acceptance tests were implemented using Maestro to simulate real user interaction scenarios such as:

- registering a new user  
- creating rides  
- filtering rides  
- reserving seats  
- cancelling reservations  

#### Continuous Integration

A GitHub Actions workflow was configured to automatically run tests whenever new commits are pushed, ensuring that new changes do not break existing functionality.

#### Sprint retrospective

What went well:

- good team collaboration
- clear division of tasks
- successful implementation of core functionality
- early validation of requirements through survey

What could be improved:

- configuring GitHub Actions workflow earlier
- refine backlog continuously

Next improvements:

- implement messaging system
- add rating and review functionality
- integrate maps API
- improve UI consistency

Link for Sprint 0 vertical prototype APK: https://expo.dev/artifacts/eas/oox2WQnwTiu29LCRyGhjN4.apk

### Sprint 1

### Sprint 2

### Sprint 3

### Sprint 4

### Final Release
