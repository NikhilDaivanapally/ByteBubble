import PlanWithFriends from "../assets/plan_with_friends.webp";
import Family from "../assets/family.webp";
import FileShare from "../assets/file_share.webp";

export const useCases = [
  {
    title: "Plan with Friends",
    description:
      "Make hangouts and group plans easier than ever. Create dedicated group chats for outings, share locations, set reminders, and drop media in real-time. Organizing with friends shouldn't feel like work.",
    image: PlanWithFriends,
    reverse: false,
  },
  {
    title: "Work Smarter",
    description:
      "Communicate seamlessly with your team. Share files, create topic-based channels, and send voice updates without clutter. Stay on track and productive with instant messaging built for collaboration.",
    image: FileShare,
    reverse: true,
  },
  {
    title: "Stay in Touch with Family",
    description:
      "Keep conversations warm and private. Create a shared space for your loved ones with secure, easy-to-use messaging. Share memories, check in daily, or just send a voice note to say hi.",
    image: Family,
    reverse: false,
  },
];

export const testimonials = [
  {
    name: "Ayesha K.",
    quote:
      "ByteBubble makes planning with friends effortless. The UI is sleek and I love the voice notes feature!",
    avatar: "/avatars/ayesha.png",
  },
  {
    name: "David M.",
    quote:
      "I use it daily with my team. Sharing files and quick updates has never been easier.",
    avatar: "/avatars/david.png",
  },
  {
    name: "Ravi P.",
    quote:
      "I set up a group for my family and we’re constantly sharing photos and chatting. Super private and smooth!",
    avatar: "/avatars/ravi.png",
  },
];
