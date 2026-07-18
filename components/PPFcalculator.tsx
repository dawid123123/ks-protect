"use client";

import { useState } from "react";

const cars = [
  "Hatchback",
  "Sedan",
  "Station",
  "SUV",
  "Mercedes GLE",
  "Mercedes G-Class",
];

const prices = {
  Hood: 89900,
  Bumper: 69900,
  Fender: 49900,
  Door: 59900,
  Roof: 99900,
};

export default function PPFCalculator() {
  const [car, setCar] = useState(cars[0]);

  return (
    <section className="ppfCalculator">
      <div className="calculatorLeft">

        <p className="eyebrow">PPF CALCULATOR</p>

        <h2>SELECT YOUR VEHICLE</h2>

        <select
          className="carSelect"
          value={car}
          onChange={(e) => setCar(e.target.value)}
        >
          {cars.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="priceList">

          <div><span>Hood</span><strong>{prices.Hood.toLocaleString()} kr</strong></div>

          <div><span>Front Bumper</span><strong>{prices.Bumper.toLocaleString()} kr</strong></div>

          <div><span>Front Fender</span><strong>{prices.Fender.toLocaleString()} kr</strong></div>

          <div><span>Door</span><strong>{prices.Door.toLocaleString()} kr</strong></div>

          <div><span>Roof</span><strong>{prices.Roof.toLocaleString()} kr</strong></div>

        </div>

      </div>

      <div className="calculatorRight">

        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop"
          alt="Mercedes"
        />

      </div>
    </section>
  );
}