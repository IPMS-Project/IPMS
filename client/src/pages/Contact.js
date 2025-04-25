import React from "react";
import "../styles/Contact.css";
import MansoorImage from "../img/mansoor.jpg";
import ContactIcon from "../Icons/ContactIcon";

const teamMembers = [
  {
    name: "Gladis Menachery Sunny",
    email: "gladis.menachery.sunny-1@ou.edu",
  },
  {
    name: "Naveena Suddapalli",
    email: "naveena.suddapalli-1@ou.edu",
  },
  {
    name: "Ravichandra Reddy",
    email: "ravichandra.reddy-1@ou.edu",
  },
  {
    name: "Narayana Phani",
    email: "narayana.phani-1@ou.edu",
  },
  {
    name: "Rahul Juluru",
    email: "rahul.juluru-1@ou.edu",
  },
  {
    name: "Saketh Reddy Aredla",
    email: "saketh.reddy.aredla-1@ou.edu",
  },
];

const Contact = () => {
  return (
    <div className="contact-container">
      <h1 className="contact-heading">Contact Us</h1>

      {/* Academic Contact */}
      <div className="contact-card">
        <img src={MansoorImage} alt="Dr. Mansoor Abdulhak" className="contact-image" />
        <div className="contact-info">
          <h2>Dr. Mansoor Abdulhak</h2>
          <p>Assistant Professor, University of Oklahoma</p>
          <p>📧 <a href="mailto=Mansoor.A.Abdulhak-1@ou.edu">Mansoor.A.Abdulhak-1@ou.edu</a></p>
          <p>📞 (405) 325-5408</p>
          <p>🏢 Devon Energy Hall, 234</p>
        </div>
      </div>

      {/* Teaching Assistant */}
      <div className="contact-card">
        <ContactIcon className="icon-large" />
        <div className="contact-info">
          <h2>SJ Ajisegiri</h2>
          <p>Teaching Assistant</p>
          <p>📧 <a href="mailto:oluwasijibomi.ajisegiri@ou.edu">oluwasijibomi.ajisegiri@ou.edu</a></p>
        </div>
      </div>

      {/* Technical Support */}
      <div className="tech-support-card">
        <h2>Technical Support – Team G</h2>
        <div className="team-grid">
          {teamMembers.map(({ name, email }) => (
            <div key={email} className="team-member">
              <ContactIcon className="icon-large" />
              <div>
                <p className="team-name">{name}</p>
                <p>
                  📧 <a href={`mailto:${email}`}>{email}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;