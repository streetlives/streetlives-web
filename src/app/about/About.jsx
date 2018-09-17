/* eslint-disable max-len */
import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="About-container">
      <div className="About-title-container">
        <div className="About-headline">Streetlives is coming soon!</div>
        <div className="About-subheader">Streetlives is currently under development. For any questions or concerns, reach out to team@streetlives.nyc</div>
      </div>
      <div className="About">
        <h2 className="About-title">About</h2>
        <h3 className="About-title">Your city, your map, your voice.</h3>
        <h4>WHAT</h4>
        <p>Streetlives is a community-built platform that will enable people who are homeless or in poverty to easily find, rate and recommend social services across New York City.</p>

        <h4>HOW</h4>
        <p>Streetlives can easily be used to quickly create, locate and view a description of services, and comment on any aspect of homeless or low income life in NYC, as well as provide warnings on difficulties and dangers faced by the community.</p>

        <p>Anyone can use Streetlives to search for services and/or to make a post.</p>

        <p>Community guidelines for posting are:</p>
        <p className="font-weight-bold">
          • Respect and do no harm to others <br />
          • Respect and do no harm to yourself
        </p>
        <p>The site will be moderated. Hate speech will be removed. Factually incorrect location posts will be amended.</p>

        <h4>WHY</h4>
        <p>Over the course of the last City fiscal year (FY 2017), more than 130,000 individuals slept in the New York City municipal shelter system. This includes over 45,000 children.</p>
        <p>
          Each night thousands of unsheltered homeless people sleep on New York City streets, in the subway system, and in other public spaces. There is no accurate measurement of New York City’s unsheltered homeless population, and recent City surveys significantly underestimate the number of unsheltered homeless New Yorkers. <br />
          <a href="http://www.coalitionforthehomeless.org/basic-facts-about-homelessness-new-york-city/">(source: Coalition for the Homeless)</a>
        </p>
        <p>Streetlives is a platform for community empowerment and self-representation. By improving the understanding of and access to relevant services, Streetlives can provide non personal data to advocate for and improve the efficacy of those services.</p>
        <p>In short, the community’s insight over time into what works and what doesn’t is shared with Service Providers without compromising user privacy.</p>
        <p>Our core mission is to build technology with homeless and at-risk communities that drives equity and positive systems change. We do not assume that we have a right to make choices for the user without consensus and the site’s functionality will adapt to and be guided by the community’s need.</p>
        <p>Feedback is gratefully welcomed.</p>
        <p>
          Thank you,<br />
          —The Streetlives team.
        </p>

        <p>Fiscal Sponsor:</p>
        <div className="About-Outreach">
          <div className="social-proof">
            <a href="https://techimpact.org/"><img alt="tech impact logo" src="img/techimpact_logo.png" /></a>
          </div>
        </div>
        <p>Partner Organization:</p>
        <div className="About-Outreach">
          <div className="social-proof">
            <a href="https://www.infoxchange.org/au/"><img alt="infoxchange logo" src="img/infoxchange_logo.png" /></a>
          </div>
        </div>
        <p>Advisors & Supporters:</p>
        <div className="About-Outreach">
          <div className="social-proof">
            <img alt="" src="img/advisors.png" />
          </div>
          <div className="social-proof">
            <a href="http://feedbacklabs.org/"><img alt="feedback labs logo" src="img/feedback_labs_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="https://www.plannedparenthood.org/"><img alt="planned parenthood logo" src="img/planned_parenthood_logo.svg" /></a>
          </div>
          <div className="social-proof">
            <a href="https://www.backonmyfeet.org/"><img alt="back_on_my_feet_logo" src="img/back_on_my_feet_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="http://neighborstogether.org/"><img alt="neighbors together logo" src="img/neighbors_together_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="https://www.careforthehomeless.org/"><img alt="care for the homeless logo" src="img/care_for_the_homeless_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="http://www.law.nyu.edu/"><img alt="nyu law logo" src="img/nyu_law_logo.png" /></a>
          </div>
        </div>
        <p>Core Partners:</p>
        <div className="About-Outreach">
          <div className="social-proof">
            <a href="http://www.aliforneycenter.org/"><img alt="ali forney logo" src="img/ali_forney_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="https://cartodb.com/"><img alt="carto logo" src="img/carto_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="http://civichall.org/"><img alt="civic hall logo" src="img/civic_hall_logo.svg" /></a>
          </div>
          <div className="social-proof">
            <a href="https://www.breadandlife.org/"><img alt="st john's logo" src="img/st_john_logo.png" /></a>
          </div>
          <div className="social-proof">
            <a href="http://www.edalliance.org/"><img alt="educational alliance logo" src="img/educational_alliance_logo.png" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
