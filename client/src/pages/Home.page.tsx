import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import {
  ArrowRightIcon,
  PlayIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { useCases, testimonials } from "../data/home.data";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const Home = () => {
  return (
    <div className="px-4 md:px-20">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="text-center mt-8">
          <div className="text-sm px-3 py-1.5  border border-btn-primary rounded-full w-fit mx-auto font-semibold">
            Stay Connected. Anytime. Anywhere
          </div>
          <h1 className="mt-6 text-2xl md:text-4xl font-semibold md:w-2/3 mx-auto">
            Your personal hub for instant, secure, and real-time communication.
          </h1>
          <p className="mt-4 text-black/60 w-4/5 md:w-2/5 mx-auto">
            Whether you're chatting with friends, collaborating with your team,
            or building a community — ChatSpace makes it effortless
          </p>

          {/* Chat Preview Animation */}
          <div className="mt-6 mx-auto w-full sm:w-3/4 md:w-1/2">
            <p className="msg bg-gray-200 p-2 px-3 mb-1 w-fit rounded-xl rounded-br-none ml-auto">
              Hi There ✋
            </p>
            <p className="msg bg-gray-200 p-2 px-3 mb-1 w-fit rounded-xl rounded-bl-none mr-auto">
              Hello
            </p>
            <div className="msg flex items-center gap-2 bg-gray-200 p-2 px-3 mb-1 w-fit rounded-xl rounded-br-none ml-auto">
              <PlayIcon className="w-6" />
              {/* waveform icon */}
              <div className="w-30"></div>
              <UserCircleIcon className="w-8" />
            </div>
            <div className="msg bg-gray-200 p-2 w-fit rounded-xl rounded-bl-none mb-1 relative mr-auto">
              <img
                className="aspect-video max-h-40 rounded-lg"
                src="https://images.unsplash.com/photo-1746061641845-0825bf320bf1?q=80&w=2070&auto=format&fit=crop"
                alt="Preview"
              />
              <div className="absolute left-5 -bottom-4 bg-gray-200 w-8 h-8 rounded-full flex-center">
                😍
              </div>
            </div>
          </div>

          <Button
            href="/signin"
            variant="outline"
            shape="pill"
            icon={<ArrowRightIcon className="w-4" />}
            iconPosition="right"
            className="mx-auto mt-6"
            size="sm"
          >
            Try Now
          </Button>
        </section>

        {/* Features */}
        <section className="mt-20">
          <h2 className="text-3xl font-semibold text-center">Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 w-full md:w-3/4 mx-auto">
            <div className="lg:col-span-2 bg-gray-100 p-6 rounded-xl border border-gray-300">
              <h3 className="text-xl font-semibold">🟢 Online Status</h3>
              <p className="mt-2 font-semibold">
                See who's active in real-time.
              </p>
              <p className="text-sm">
                Stay connected with presence indicators so you know when your
                friends or teammates are available to chat.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300">
              <h3 className="text-xl font-semibold">
                📎 File & Document Sharing
              </h3>
              <p className="mt-2 font-semibold">
                Share work files or personal docs instantly.
              </p>
              <p className="text-sm">
                From PDFs to spreadsheets, send and receive files seamlessly in
                your conversations.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300">
              <h3 className="text-xl font-semibold">🖼️ Image Sharing</h3>
              <p className="mt-2 font-semibold">
                Bring your chats to life with visuals.
              </p>
              <p className="text-sm">
                Send photos, screenshots, or memes directly into the chat — fast
                and secure.
              </p>
            </div>
            <div className="lg:col-span-2 bg-gray-100 p-6 rounded-xl border border-gray-300">
              <h3 className="text-xl font-semibold">🎤 Voice Messages</h3>
              <p className="mt-2 font-semibold">
                Say it out loud when typing just won’t do.
              </p>
              <p className="text-sm">
                Record and send voice messages with one tap for more personal,
                expressive communication.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Use Cases</h2>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
              See how ChatApp fits into your daily life. Whether you're catching
              up with friends or collaborating on work, ChatApp adapts to your
              world.
            </p>

            <div className="space-y-16">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row ${
                    useCase.reverse ? "md:flex-row-reverse" : ""
                  } items-center gap-8`}
                >
                  <div className="w-full md:w-1/2">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="w-full min-h-[50vh] rounded-2xl shadow-md"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600">{useCase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              What Our Users Say
            </h2>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop
              autoplay={{ delay: 4000 }}
              pagination={{ el: ".custom-swiper-pagination", clickable: true }}
            >
              {testimonials.map((user, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-gray-50 p-8 shadow-lg shadow-gray-100 rounded-2xl  max-w-xl mx-auto text-center">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                    <p className="text-gray-600 italic mb-3">“{user.quote}”</p>
                    <h4 className="text-gray-800 font-semibold">{user.name}</h4>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="custom-swiper-pagination mt-6 flex justify-center gap-2"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
