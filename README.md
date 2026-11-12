# Olam (עוֹלָם) — 3D Cosmic & Kabbalistic Time Tracker

An interactive 3D observatory and time tracker that maps real-time astronomy, Moon phases, and Hebrew calendar cycles onto the Tree of Life (*Etz Chaim*) and *Sefer Yetzirah* — translating ancient Jewish mysticism into plain, practical daily guidance.

**Live App:** [https://awerds.github.io/olam/](https://awerds.github.io/olam/)

Built 100% client-side with **Three.js / React Three Fiber**, **`astronomy-engine`** (VSOP87/JPL ephemeris), **`@hebcal/core`**, and **Radix UI**.

## Esoteric & Astronomical Systems Included
- **Layer I — *Etz Chaim* (3D Tree of Life) & *Sefer Yetzirah* Cube of Space:**
  - 10 *Sefirot* across the 3 Pillars with Divine Names (*Atzilut*), Archangels (*Beriah*), Angelic Choirs (*Yetzirah*), and Planetary Spheres (*Assiah*).
  - 22 Hebrew Letter paths with instant toggle between **Classical Gra (Vilna Gaon)** and **Lurianic (Ari)** path mappings.
  - 3D **Cube of Space** showing the 3 Mother Letter axes ($\aleph, \Mem, \Shin$), 7 Double Letter faces ($\Bet, \Gimel, \Dalet, \Kaf, \Pe, \Resh, \Tav$), and 12 Simple Letter edges.
  - Dynamic **Zoharic Solar-Lunar Conduit (*Tiferet* $\rightarrow$ *Yesod* $\rightarrow$ *Malkhut*)** that waxes and wanes with the Moon's illumination (*Milui HaLevanah* on the 15th vs *Molad* concealment).
- **Layer II — The 7 Planetary Palaces (*Heikhalot*), *Sha'ot Zmaniyot* & *Teli*:**
  - True geocentric ecliptic longitudes, latitudes, retrograde detection (*Hilukh Achori*), and Ptolemaic/Kabbalistic aspect chords.
  - Proportional Halachic Planetary Hours (*Sha'ot Zmaniyot*) governed by the classical Chaldean/Kabbalistic sequence (**שצ״ם חנכ״ל**).
  - **Teli Axis (*Rosh HaTeli* & *Zanav HaTeli*):** Ascending & Descending Lunar Nodes (*Sefer Yetzirah* 6:1).
- **Layer III — 12 *Mazalot*, *Sod Ha'Ibbur* & 72 Names (*Shem HaMephorash*):**
  - 12 Constellations (*Taleh* through *Dagim*), 12 Hebrew Lunar Months, 12 Tribes of Israel, and *Tikkun* faculties.
  - Traditional Jerusalem *Molad* down to the *Chelek* ($1/18\text{th}$ of a minute), 19-Year Metonic *Ibbur* cycle, 7-Year *Shmita* & 50-Year *Yovel* Jubilee cycles, *Sefirat HaOmer*, and the 6,000-Year Cosmic Week.
  - 72 Names of God (*Shem HaMephorash*) mapped around the 360° ecliptic (5° per Name) and 20-minute diurnal gates.
- **4D Time-Helix Walk Mode:**
  - Unfolds the circular orbits along the Z-axis into a 3D spiral corridor of New Moons (*Rosh Chodesh*) and Full Moons (*15th of the Hebrew Month*).

## Local Development & GitHub Pages Deployment

```bash
npm install
npm run dev
```

To build and publish updates directly to **GitHub Pages** (`gh-pages` branch):

```bash
npm run deploy
```

