export default class AboutPage {
  async render() {
    return `
      
      <section class="container about-page-container"> 
        <h1 class="about-title">About Sweet Trails</h1> 
        <p>
          Welcome to Sweet Trails! &#128062 &#128150 This app is your space to share and discover
          sweet stories from different locations. Leave your story trails in memorable places,
          and see what tales others have shared around you or in places
          you plan to visit.
        </p>
        <p>
          With Sweet Trails, every location can have its own story. Take a photo, write your tale,
          pin the location on the map, and let others experience your special moment.
          Explore the map to find hidden stories and see the world from a new perspective.
        </p>
        <p>
          This application was created as part of the "Intermediate Web Development" class submission.
          Built with modern web technologies like Webpack, JavaScript, and LeafletJS for interactive map features,
          and utilizes Web APIs for camera access and story sharing.
        </p>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
