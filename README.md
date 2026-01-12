# MU/TH/UR 6000 Interface - Michal Bubílek CV

**Live Version:** [https://www.bubilek.cz/-/cv/](https://www.bubilek.cz/-/cv/)

This project is an interactive personal portfolio/CV styled after the **MU/TH/UR 6000** computer interface from the **Alien** movie franchise (Nostromo).

It features a retro sci-fi terminal design, typing animations, immersive audio, and random system events simulating the atmosphere of the USCSS Nostromo.

## Features

-   **Retro Terminal UI**: CRT scanlines, flicker effects, and monochromatic green phosphor aesthetic.
-   **Interactive Typing**: CV content is "typed" out character by character.
    -   *Click anywhere in the terminal to skip the typing animation and display text instantly.*
-   **Immersive Audio**: Background ambient engine noise and mechanical keyboard typing sounds.
    -   Mute and Volume controls available in the header.
-   **System Events**: Randomly occurring console logs simulating ship status:
    -   Crew biosignal monitoring (and loss).
    -   Hull integrity warnings.
    -   Xenomorph detection alerts.
    -   "glitch" effects simulating power fluctuations.
-   **Command Line**: Functional input line (active after CV prints).
    -   Try commands like `shutdown`, `destruct`, or `selfdestruct`.
-   **Responsive Design**: Optimized for desktop and mobile devices.

## Tech Stack

-   **HTML5**
-   **CSS3** (CSS Variables, keyframe animations, flexbox)
-   **Vanilla JavaScript** (No frameworks / Zero dependencies)

## Setup & Deployment

This is a static website. You can host it anywhere (GitHub Pages, Vercel, Netlify, Apache/Nginx).

1.  Clone the repository.
2.  Ensure existing directory structure:
    -   `/audio`: `nostromo.mp3`, `computer.mp3`
    -   `/video`: `head_720p.mp4`
    -   `/img`: `mb.webp`, favicons
3.  Open `index.html` in your browser.

### Apache Configuration
An `.htaccess` file is included for Apache servers to handle:
-   Security (disabled indexing)
-   Performance (Gzip compression, Browser caching)
-   Error handling (404 redirects)

## License & Credits

-   Design inspired by the 1979 film **Alien** (Ridley Scott).
-   Created by **Michal Bubílek**.
