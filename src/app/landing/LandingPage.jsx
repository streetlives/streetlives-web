import React, { Component } from 'react';
import Icon from '../../components/icon';
import GetStartedButton from './GetStartedButton';
import Testimonial from './Testimonial';
import PartnerPicture from './PartnerPicture';
import './LandingPage.css';

const feedbackEmail = 'trust@gogetta.nyc';

class LandingPage extends Component {
  getStarted = () => {
    this.props.history.push('/find');
  };

  scrollToContent = () => {
    this.contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  contentRef = React.createRef();

  render() {
    return (
      <div className="LandingPage">
        <div className="Intro Section">
          <div className="IntroTitle">
            <img src="/img/streetlives_logo.png" alt="" />
            <div>GoGetta</div>
          </div>

          <div className="IntroBody">
            <div className="IntroTop">
              <h1>Get what <span className="Emphasis">you</span> need</h1>
              <p>
                Find food, clothing and personal care services just right for you
              </p>
            </div>
            <div className="IntroBottom">
              <Icon name="chevron-down" size="2x" onClick={this.scrollToContent} />
              <GetStartedButton onClick={this.getStarted} />
            </div>
          </div>
        </div>

        <div className="Onboarding" ref={this.contentRef}>
          <div className="Section">
            <div className="OnboardingSectionNumber">1</div>

            <h3>How it works</h3>
            <h2>Search for what you need</h2>
            <p>
              GoGetta has New York’s most up-to-date community-verified provider information on:
            </p>

            <img
              src="img/landing_page/map.png"
              alt="map showing food, clothing, and personal care markers"
            />
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">2</div>

            <h2>Find providers that will actually serve <span className="Emphasis">you</span></h2>
            <p>
              Answer a few questions and we will show you locations that cover your specific needs,
              from age to gender to family situations.
            </p>

            <img src="img/landing_page/provider.png" alt="" />
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">3</div>

            <h2>You’re all set!</h2>
            <p>
              See the details of the services and go get what you need.
            </p>
          </div>
        </div>

        <GetStartedButton onClick={this.getStarted} />

        <div className="Testimonials Section">
          <h3 className="TestimonialsTitle">GoGettas are saying</h3>
          <Testimonial
            img="img/landing_page/testimonial_jeffrey.png"
            name="Jeffrey"
            text="I know this information is good, it’s from people like me"
          />
          <Testimonial
            img="img/landing_page/testimonial_kenia.png"
            name="Kenia"
            text="Usually, if I need something, I ask. But this is faster, easier, better."
          />
          <Testimonial
            img="img/landing_page/testimonial_gayle.png"
            name="Gayle"
            text="Boom! I go in and there’s all this information."
          />
        </div>

        <GetStartedButton onClick={this.getStarted} />

        <div className="Partners Section">
          <h3>Our partners</h3>
          <h2>Love to our partners!</h2>

          <div className="PartnerPictures">
            <PartnerPicture
              link="https://aws.amazon.com/"
              alt="aws logo"
              src="img/aws_logo.png"
            />
            <PartnerPicture
              link="https://www.careforthehomeless.org/"
              alt="care for the homeless logo"
              src="img/care_for_the_homeless_logo.png"
            />
            <PartnerPicture
              link="http://neighborstogether.org/"
              alt="neighbors together logo"
              src="img/neighbors_together_logo.png"
            />
            <PartnerPicture
              link="http://www.law.nyu.edu/"
              alt="nyu law logo"
              src="img/nyu_law_logo.png"
            />
            <PartnerPicture
              link="https://openreferral.org/"
              alt="open referral logo"
              src="img/openreferral_logo.png"
            />
            <PartnerPicture
              link="https://www1.nyc.gov/site/dhs/index.page"
              alt="nyc dhs logo"
              src="img/nyc_dhs_logo.png"
            />
          </div>
        </div>

        <div className="Feedback Section">
          <h2>We’re all about feedback</h2>
          <p>Tell us what you think at:</p>
          <div className="FeedbackEmail">
            <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
