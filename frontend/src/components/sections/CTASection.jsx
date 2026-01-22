import React from 'react'

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="bg-linear-to-r from-sand to-nude rounded-3xl p-12 md:p-16 text-center border border-sand/50 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
            Ready to Join the Creative Revolution?
          </h2>
          <p className="text-xl text-cream mb-8 max-w-2xl mx-auto">
            Start streaming exclusive content from the world's most talented artists. Your journey begins here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-5 bg-deepbrown text-cream rounded-full text-lg font-bold hover:bg-deepbrown/90 transition transform hover:scale-105 shadow-xl">
              Start Watching
            </button>
            <button className="px-10 py-5 bg-cream text-deepbrown rounded-full text-lg font-bold hover:bg-beige transition shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
