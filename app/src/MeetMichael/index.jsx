import React from 'react';
import michael from './img/michael.jpg';
import ArrowDown from '../Shared/ArrowDown';
//import Navigation from '../Shared/Navigation';
import { Link } from 'react-router-dom';
import './MeetMichael.css';

const aboutText = "Michael Ralph has a degree in Africana Studies from Morris Brown College and a doctorate in Anthropology from the University of Chicago. He is a tenured professor at New York University, where he teaches “Histories of Capitalism,” “Hip Hop and Politics,” “Digital Humanities,” and “Armed Resistance.” Michael is dedicated to the quest for quintessential dopeness. ";

const MeetMichael = props => {
    return (
        <section className="about-michael-container">
            {/* <Navigation /> */}
            <div>
                <img src={michael} alt="michael ralph" />
                <p>{aboutText}</p>
            </div>
            <Link to="/map" className="arrow-down-link">
                <span>Data Maps</span>
                <ArrowDown />
            </Link>
        </section>
    )
}

export default MeetMichael;