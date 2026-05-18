import React from 'react'
import '../assets/styles/card.css'

const Card = ({ icon, value, title }) => {
    return (
      <section className="cardContainer background">
        <img src={icon} alt={`Icon representing ${title}`} className="cardIcon" />
        <div className="cardContent">
          <p className="cardTitle">{title}</p>
          <p className="cardValue">{value}</p>
          <p className="cardSubtitle">Current Value</p>
        </div>
      </section>
    );
  };

export default Card
