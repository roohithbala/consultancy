import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-primary text-secondary transition-colors duration-300">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
