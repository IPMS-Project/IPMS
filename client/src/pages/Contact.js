import React from "react";
import "../styles/Contact.css";
import MansoorImage from "../img/mansoor.jpg";
import ContactIcon, { IconComponent } from "../Icons/ContactIcon";

const teamMembers = [
  {
    name: "Gladis Menachery Sunny",
    email: "Gladis.Menachery.Sunny-1@ou.edu",
    role: "Token Generation and Login"
  },
  {
    name: "Ravichandra Reddy",
    email: "Ravichandra.Reddy.Mulagondla-1@ou.edu",
    role: "A.1 Form"
  },
  {
    name: "Naveena Suddapalli",
    email: "Naveena.Suddapalli-1@ou.edu",
    role: "A.2 Weekly Report"
  },
  {
    name: "Saketh Reddy Aredla",
    email: "Saketh.Reddy.Aredla-1@ou.edu",
    role: "A.3 Form"
  },
  {
    name: "Rahul Juluru",
    email: "Rahul.Juluru-1@ou.edu",
    role: "Supervisor approval workflow"
  },
  {
    name: "Narayana Phani Charan Nimmagadda",
    email: "Narayana.Phani.Charan.Nimmagadda-1@ou.edu",
    role: "Coordinator Approval workflow"
  },
];

const MansoorEmail = "Mansoor.A.Abdulhak-1@ou.edu";
const AssistantEmail = "Oluwasijibomi.Ajisegiri@ou.edu";

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
          <p>📧 <a href={`mailto=${MansoorEmail}`}>{MansoorEmail}</a></p>
          <p>📞 (405) 325-5408</p>
          <p>🏢 Devon Energy Hall, 234</p>
        </div>
      </div>

      {/* Teaching Assistant */}
      <div className="contact-card">
        <ContactIcon IconComponent={() => <IconComponent className="team-icon" />} />
        <div className="contact-info">
          <h4>SJ Ajisegiri</h4>
          <p>Teaching Assistant</p>
          <p>📧 <a href={`mailto:${AssistantEmail}`}>{AssistantEmail}</a></p>
        </div>
      </div>

      {/* Technical Support */}
      <div className="tech-support-card">
        <h2>Technical Support – Team G</h2>
        <div className="team-grid">
          {teamMembers.map(({ name, email, role }) => (
            <div key={email} className="team-member">
              <ContactIcon IconComponent={() => <IconComponent className="team-icon" />} />
              <div>
                <h6>{name}</h6>
                <p>{role}</p>
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