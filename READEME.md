# FlixRecom 🎬

FlixRecom is a modern audiovisual content recommendation platform that helps users discover and explore movies, series, and documentaries. Using YouTube and TMDB APIs, the system offers a complete experience with detailed information, trailers, and streaming options.

## 🌟 Key Features

- Advanced search for movies, series, and documentaries
- Integrated trailers via YouTube
- Detailed cast and crew information
- Discovery of available streaming platforms
- Personalized recommendation system
- Responsive interface optimized for all devices
- Multi-language support

## 🛠️ Technologies Used

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Axios

- **APIs:**
  - YouTube Data API v3
  - The Movie Database (TMDB) API
  


## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- NPM or Yarn
- YouTube and TMDB API keys

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Anjsvf/flixrecom.git
cd flixrecom
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```
Edit the `.env.local` file with your API keys:
```
YOUTUBE_API_KEY=your_youtube_key
TMDB_API_KEY=your_tmdb_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Access `http://localhost:3000` in your browser

## 📝 Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Generates the production build
- `npm run start` - Starts the production server
- `npm run lint` - Runs linting checks
- `npm run test` - Runs tests

## 🤝 How to Contribute

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 📫 Contact

For suggestions, questions, or contributions, please open an [issue](https://github.com/Anjsvf/flixrecom/issues).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the excellent framework
- [TMDB](https://www.themoviedb.org) for the rich content API
- [YouTube](https://developers.google.com/youtube) for trailer support

---

Developed with ❤️ by the FlixRecom team