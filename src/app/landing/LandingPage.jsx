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
            <img src="/img/gogetta.svg" alt="" />
            <div>GoGetta</div>
          </div>

          <div className="IntroBody">
            <div className="IntroTop">
              <h1>
                Get what <span className="Emphasis">you</span> need
              </h1>
              <p>
                Find food, clothing, personal care, shelter, and other services
                that are <strong>verified by the community</strong> and right
                for you.
              </p>
              <div className="IntroTop arrow">
                <Icon
                  name="chevron-down"
                  size="2x"
                  onClick={this.scrollToContent}
                />
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
                GoGetta has New York’s most up-to-date service information on
                food, personal care, shelter, and clothing.
              </p>
            </div>

            <picture>
              {/* mobile jpg */}
              <source
                media="(max-width: 1223px)"
                srcSet="/img/landing_page/step1_mobile2x.jpg"
                type="image/jpeg"
              />
              {/* mobile webp */}
              <source
                media="(max-width: 1223px)"
                srcSet="/img/landing_page/step1_mobile2x.webp"
                type="image/webp"
              />
              {/* desktop jpg */}
              <source
                media="(min-width: 1224px)"
                srcSet="/img/landing_page/step1_desktop1x.jpg 1x,
                /img/landing_page/step1_desktop2x.jpg 2x"
                type="image/jpeg"
              />
              {/* desktop webp */}
              <source
                media="(min-width: 1224px)"
                srcSet="/img/landing_page/step1_desktop1x.webp 1x,
              /img/landing_page/step1_desktop2x.webp 2x"
                type="image/webp"
              />
              <img
                src="/img/landing_page/step1_mobile2x.jpg"
                className="OnboardingImage"
                alt="map showing food, clothing, shelter, and personal care markers"
              />
            </picture>

            {/* <picture>
              <source
                className="OnboardingImage"
                media="(min-width: 1920px)"
                srcSet="img/landing_page/step1_3820.webp"
              />
              <source
                className="OnboardingImage"
                media="(min-width: 1224px)"
                srcSet="img/landing_page/step1_1920.webp"
              />
              <img
                className="OnboardingImage"
                src="img/landing_page/step1_mobile.webp"
                alt="map showing food, clothing, shelter, and personal care markers"
              />
            </picture> */}
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">2</div>
            <div className="OnboardingText">
              <h2>
                Find providers that will actually serve{" "}
                <span className="Emphasis">you</span>
              </h2>
              <p className="text-lighter">
                Filter or answer a few questions and we will show you locations
                that meet your specific needs, from age to gender to family
                situations.
              </p>
            </div>
            <picture>
              {/* desktop jpg */}
              <source
                media="(min-aspect-ratio: 2/3)"
                srcSet="/img/landing_page/step2_desktop1x.jpg 1x,
                /img/landing_page/step2_desktop2x.jpg 2x"
                type="image/jpeg"
              />
              {/* desktop webp */}
              <source
                media="(min-aspect-ratio: 2/3)"
                srcSet="/img/landing_page/step2_desktop1x.webp 1x,
              /img/landing_page/step2_desktop2x.webp 2x"
                type="image/webp"
              />
              {/* mobile jpg */}
              <source
                srcSet="/img/landing_page/step2_mobile2x.jpg"
                type="image/jpeg"
              />
              {/* mobile webp */}
              <source
                srcSet="/img/landing_page/step2_mobile2x.webp"
                type="image/webp"
              />
              <img
                className="OnboardingImage"
                src="/img/landing_page/step2_mobile2x.jpg"
                alt="Welcome sign"
              />
            </picture>
          </div>

          <div className="Section">
            <div className="OnboardingSectionNumber">3</div>

            <div className="OnboardingText">
              <h2>You’re all set!</h2>
              <p className="text-lighter">
                See the service details, go get what you need. We don’t keep
                your personal data, so your privacy is protected.
              </p>
              <GetStartedButton onClick={this.getStarted} primary fluid />
            </div>

            <picture>
              {/* mobile jpg */}
              <source
                media="(max-width: 1223px)"
                srcSet="/img/landing_page/step3_mobile2x.jpg"
                type="image/jpeg"
              />
              {/* mobile webp */}
              <source
                media="(max-width: 1223px)"
                srcSet="/img/landing_page/step3_mobile2x.webp"
                type="image/webp"
              />
              {/* desktop jpg */}
              <source
                media="(min-width: 1224px)"
                srcSet="/img/landing_page/step3_desktop1x.jpg 1x,
                /img/landing_page/step3_desktop2x.jpg 2x"
                type="image/jpeg"
              />
              {/* desktop webp */}
              <source
                media="(min-width: 1224px)"
                srcSet="/img/landing_page/step3_desktop1x.webp 1x,
              /img/landing_page/step3_desktop2x.webp 2x"
                type="image/webp"
              />
              <img
                className="OnboardingImage"
                src="/img/landing_page/step3_mobile2x.jpg"
                alt="woman with groceries"
              />
            </picture>
          </div>
        </div>

        <div className="Testimonials Section">
          <div className="TestimonialsInner">
            <h3 className="TestimonialsTitle">GoGettas are saying</h3>
            <Testimonial
              imagePartialPath="testimonial1"
              name="Jeffrey"
              text="I know this information is good, it’s from people like me"
            />
            <Testimonial
              imagePartialPath="testimonial2"
              name="Kenia"
              text="Usually, if I need something, I ask. But this is faster, easier, better."
            />
            <Testimonial
              imagePartialPath="testimonial3"
              name="Gia"
              text="Boom! I go in and there’s all this information."
            />
          </div>
          <div className="TestimonialBtn">
            <GetStartedButton
              onClick={this.getStarted}
              fluid
              className="btnWhite"
            />
          </div>
        </div>
        <div className="Partners Section">
          <h3>Collaboration</h3>
          <h2>Love for the help we’ve had to create GoGetta!</h2>
          <div className="PartnerPictures">
            <PartnerPicture
              link="http://www.aliforneycenter.org/"
              alt="Ali Forney logo"
              imagePartialPath="ali_forney"
            />
            <PartnerPicture
              link="https://www.breadandlife.org/"
              alt="St. Johns' logo"
              imagePartialPath="st_john"
            />
            <PartnerPicture
              link="https://www.careforthehomeless.org/"
              alt="Care for the Homeless logo"
              imagePartialPath="care_for_the_homeless"
            />
            <PartnerPicture
              link="https://civichall.org/"
              alt="Civic Hall logo"
              imagePartialPath="civic_hall"
            />
            <PartnerPicture
              link="http://www.edalliance.org/"
              alt="Education Alliance logo"
              imagePartialPath="educational_alliance"
            />
            <PartnerPicture
              link="https://www.nycfoodpolicy.org/"
              alt="NYC Food Policy logo"
              imagePartialPath="hunter_college"
            />
            <PartnerPicture
              link="https://www.infoxchange.org/au/"
              alt="InfoXChange logo"
              imagePartialPath="infoxchange"
            />
            <PartnerPicture
              link="http://minnow.io/"
              alt="Minnow logo"
              imagePartialPath="minnow"
            />
            <PartnerPicture
              link="http://neighborstogether.org/"
              alt="Neighbors Together logo"
              imagePartialPath="neighbors_together"
            />
            <PartnerPicture
              link="https://www.ncsinc.org/"
              alt="Neighborhood Coalition For Shelter logo"
              imagePartialPath="neighborhood_coalition"
            />
            <PartnerPicture
              link="https://www1.nyc.gov/site/dhs/index.page"
              alt="NYC DHS logo"
              imagePartialPath="nyc"
            />
            <PartnerPicture
              link="http://www.law.nyu.edu/"
              alt="NYU Law logo"
              imagePartialPath="nyu_law"
            />
            <PartnerPicture
              link="https://opencollective.com/streetlives"
              alt="Open Collective logo"
              imagePartialPath="open_collective"
            />
            <PartnerPicture
              link="https://openreferral.org/"
              alt="Open Referral logo"
              imagePartialPath="openreferral"
            />
            <PartnerPicture
              link="https://holyapostlessoupkitchen.org/"
              alt="Holy Apostles logo"
              imagePartialPath="holy_apostles"
            />
            <PartnerPicture
              link="https://aws.amazon.com/"
              alt="AWS logo"
              imagePartialPath="aws"
            />
            <PartnerPicture
              link="https://www.usdigitalresponse.org/"
              alt="US Digital Response logo"
              imagePartialPath="usdr"
            />
          </div>
          <p className="text-lighter">
            Food service information provided with the help of Hunter College
            NYC Food Policy Center.
          </p>
          <p className="text-lighter">For more information, visit:</p>
          <p>
            <a href="https://www.nycfoodpolicy.org/food">
              https://www.nycfoodpolicy.org/food
            </a>
          </p>
        </div>
        <div className="AboutUs Section">
          <h3>Who we are</h3>
          <div>
            <p>
              GoGetta is a Streetlives product. Streetlives is a US non-profit
              under our fiscal host the Open Collective Foundation.
            </p>
            <p>
              We build technology with communities considered vulnerable, New
              York social service providers, and other system stakeholders in a
              whole-of-community partnership.
            </p>
          </div>
          <div>
            <picture>
              <source
                className="OnboardingImage"
                media="(min-width: 1224px)"
                srcSet="img/streetlives_text_logo.png"
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
