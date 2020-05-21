import React, { Component } from 'react';
import Icon from '../../components/icon';
import GetStartedButton from './GetStartedButton';
import Testimonial from './Testimonial';
import PartnerPicture from './PartnerPicture';
import './LandingPage.css';

const feedbackEmail = 'gogetta@streetlives.nyc';

class LandingPage extends Component {
  getStarted = () => {
    this.props.history.push('/find');
  };

  scrollToContent = () => {
    this.contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  scrollToContentTop = () => {
    this.topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  contentRef = React.createRef();
  topRef = React.createRef();

  render() {
    return (
      <div className="LandingPage">
        <div className="Intro Section">
          <div className="IntroTitle" ref={this.topRef}>
            <img src="/img/gogetta_logo.svg" alt="" />
            <div>GoGetta</div>
          </div>

          <div className="IntroBody">
            <div className="IntroTop">
              <h1>Get what <span className="Emphasis">you</span> need</h1>
              <p>
                Find food, clothing, personal care, shelter, and other services that are{' '}
                <strong>verified by the community</strong> and right for you.
              </p>
              <div className="IntroTop arrow">
                <Icon name="chevron-down" size="2x" onClick={this.scrollToContent} />
              </div>
            </div>
            <div className="IntroBottom">
              <GetStartedButton onClick={this.getStarted} primary fluid />
            </div>
          </div>
        </div>

        <div className="Onboarding" ref={this.contentRef}>
          <div className="Section">
            <div className="OnboardingSectionNumber">1</div>

            <div className="OnboardingText">
              <h3>How it works</h3>
              <h2>Search for what you need</h2>
              <p className="text-lighter">
                GoGetta has New York’s most up-to-date service information on food, personal care, shelter, and clothing.
              </p>
            </div>

            <picture>
              <source
                className="OnboardingImage"
                media="(min-aspect-ratio: 2/3)"
                srcSet="img/landing_page/step1.png"
              />
              <img
                className="OnboardingImage"
                src="img/landing_page/step1_mobile.png"
                alt="map showing food, clothing, and personal care markers"
              />
            </picture>
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">2</div>
            <div className="OnboardingText">
              <h2>Find providers that will actually serve <span className="Emphasis">you</span></h2>
              <p className="text-lighter">
                Filter or answer a few questions and we will show you locations that meet your specific needs, from age to gender to family situations.
              </p>
            </div>
            <picture>
              <source
                className="OnboardingImage"
                media="(min-aspect-ratio: 2/3)"
                srcSet="img/landing_page/step2.png"
              />
              <img
                className="OnboardingImage"
                src="img/landing_page/step2_mobile.png"
                alt="Welcome sign"
              />
            </picture>
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">3</div>

            <div className="OnboardingText">
              <h2>You’re all set!</h2>
              <p className="text-lighter">
                See the service details, go get what you need. We don’t keep your personal data, so your privacy is protected.
              </p>
              <GetStartedButton onClick={this.getStarted} primary fluid />
            </div>

            <picture>
              <source
                className="OnboardingImage"
                media="(min-aspect-ratio: 2/3)"
                srcSet="img/landing_page/step3.png"
              />
              <img
                className="OnboardingImage"
                src="img/landing_page/step3_mobile.png"
                alt="map showing food, clothing, and personal care markers"
              />
            </picture>
          </div>
        </div>

        <div className="Testimonials Section">
          <div className="TestimonialsInner">
            <h3 className="TestimonialsTitle">GoGettas are saying</h3>
            <Testimonial
              img={{
                small: 'img/landing_page/testimonial_jeffrey_mobile.png',
                large: 'img/landing_page/testimonial_jeffrey.png',
              }}
              name="Jeffrey"
              text="I know this information is good, it’s from people like me"
            />
            <Testimonial
              img={{
                small: 'img/landing_page/testimonial_kenia_mobile.png',
                large: 'img/landing_page/testimonial_kenia.png',
              }}
              name="Kenia"
              text="Usually, if I need something, I ask. But this is faster, easier, better."
            />
            <Testimonial
              img={{
                small: 'img/landing_page/testimonial_gia_mobile.png',
                large: 'img/landing_page/testimonial_gia.png',
              }}
              name="Gia"
              text="Boom! I go in and there’s all this information."
            />
          </div>
          <GetStartedButton onClick={this.getStarted} fluid className="btnWhite" />
        </div>
        <div className="Partners Section">
          <h3>Collaboration</h3>
          <h2>Love for the help we’ve had to create GoGetta!</h2>
          <div className="PartnerPictures">
            <PartnerPicture
              link="http://www.aliforneycenter.org/"
              alt="Ali Forney logo"
              img={{
                small: 'img/partners/ali_forney_mobile_logo.png',
                large: 'img/partners/ali_forney_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www.breadandlife.org/"
              alt="St. Johns' logo"
              img={{
                small: 'img/partners/st_john_mobile_logo.png',
                large: 'img/partners/st_john_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www.careforthehomeless.org/"
              alt="care for the homeless logo"
              img={{
                small: 'img/partners/care_for_the_homeless_mobile_logo.png',
                large: 'img/partners/care_for_the_homeless_logo.png',
              }}
            />
            <PartnerPicture
              link="https://civichall.org/"
              alt="Civic Hall logo"
              img={{
                small: 'img/partners/civic_hall_mobile_logo.png',
                large: 'img/partners/civic_hall_logo.png',
              }}
            />
            <PartnerPicture
              link="http://www.edalliance.org/"
              alt="Education Alliance logo"
              img={{
                small: 'img/partners/educational_alliance_mobile_logo.png',
                large: 'img/partners/educational_alliance_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www.nycfoodpolicy.org/"
              alt="NYC Food Policy logo"
              img={{
                small: 'img/partners/hunter_college_mobile.png',
                large: 'img/partners/hunter_college.png',
              }}
            />
            <PartnerPicture
              link="https://www.infoxchange.org/au/"
              alt="InfoXChange logo"
              img={{
                small: 'img/partners/infoxchange_mobile_logo.png',
                large: 'img/partners/infoxchange_logo.png',
              }}
            />
            <PartnerPicture
              link="http://minnow.io/"
              alt="Minnow logo"
              img={{
                small: 'img/partners/minnow_mobile_logo.png',
                large: 'img/partners/minnow_logo.png',
              }}
            />
            <PartnerPicture
              link="http://neighborstogether.org/"
              alt="neighbors together logo"
              img={{
                small: 'img/partners/neighbors_together_mobile_logo.png',
                large: 'img/partners/neighbors_together_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www.ncsinc.org/"
              alt="Neighborhood Coalition For Shelter logo"
              img={{
                small: 'img/partners/neighborhood_coalition_for_shelter_mobile_logo.png',
                large: 'img/partners/neighborhood_coalition_for_shelter_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www1.nyc.gov/site/dhs/index.page"
              alt="nyc dhs logo"
              img={{
                small: 'img/partners/nyc_mobile_logo.png',
                large: 'img/partners/nyc_logo.png',
              }}
            />
            <PartnerPicture
              link="http://www.law.nyu.edu/"
              alt="nyu law logo"
              img={{
                small: 'img/partners/nyu_law_mobile_logo.png',
                large: 'img/partners/nyu_law_logo.png',
              }}
            />
            <PartnerPicture
              link="https://opencollective.com/streetlives"
              alt="Open Collective logo"
              img={{
                small: 'img/partners/open_collective_mobile_logo.png',
                large: 'img/partners/open_collective_logo.png',
              }}
            />
            <PartnerPicture
              link="https://openreferral.org/"
              alt="open referral logo"
              img={{
                small: 'img/partners/openreferral_mobile_logo.png',
                large: 'img/partners/openreferral_logo.png',
              }}
            />
            <PartnerPicture
              link="https://holyapostlessoupkitchen.org/"
              alt="Holy Apostles logo"
              img={{
                small: 'img/partners/holy_apostles_mobile_logo.png',
                large: 'img/partners/holy_apostles_logo.png',
              }}
            />
            <PartnerPicture
              link="https://aws.amazon.com/"
              alt="aws logo"
              img={{
                small: 'img/partners/aws_mobile_logo.png',
                large: 'img/partners/aws_logo.png',
              }}
            />
            <PartnerPicture
              link="https://www.usdigitalresponse.org/"
              alt="US Digital Response logo"
              img={{
                small: 'img/partners/us_digital_response_mobile_logo.png',
                large: 'img/partners/us_digital_response_logo.png',
              }}
            />
          </div>
          <p className="text-lighter">Food service information provided with the help of Hunter College NYC Food Policy Center.</p>
          <p className="text-lighter">For more information, visit:</p>
          <p>
            <a href="https://www.nycfoodpolicy.org/food">https://www.nycfoodpolicy.org/food</a>
          </p>
        </div>
        <div className="AboutUs Section">
          <h3>Who we are</h3>
          <div>
            <p>GoGetta is a Streetlives product. Streetlives is a US non-profit under our fiscal host the Open Collective Foundation.</p>
            <p>
              We build technology with communities considered vulnerable, New York social service providers, and other system stakeholders in a whole-of-community partnership.
            </p>
          </div>
          <div>
            <picture>
              <source
                className="OnboardingImage"
                media="(min-aspect-ratio: 2/3)"
                srcSet="img/streetlives_wtext_logo.png"
              />
              <img
                src="img/streetlives_text_mobile_logo.png"
                alt="Streetlives logo"
                className="about-logo"
              />
            </picture>
          </div>
        </div>

        <div className="Feedback Section">
          <h2>We’re all about feedback</h2>
          <p>Tell us what you think at:</p>
          <div className="FeedbackEmail">
            <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>
          </div>
          <div className="arrowUp" onClick={this.scrollToContentTop}>
            <Icon name="chevron-up" size="2x" />
            <p>Back to top</p>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingPage;
