import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import CourseCatalog from './CourseCatalog';

// Logged-out visitors see the marketing landing page; signed-in users go
// straight to the course catalog instead of a duplicate "welcome" screen.
export default function Home() {
  const { user } = useAuth();
  return user ? <CourseCatalog /> : <LandingPage />;
}
