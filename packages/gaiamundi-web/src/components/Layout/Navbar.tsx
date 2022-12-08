import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from 'components/Button/Button';
import { LogoLink } from './LogoLink';
import { AccountDropdown } from 'components/Account/AccountDropdown';
import Hamburger from 'components/Icons/Hamburger';
import { useAuth } from 'hooks/useAuth';
import { MobileNavbar } from './MobileNavbar';
import { Link, useLocation } from 'react-router-dom';

const NavbarMenuItem: React.FC<{
  href: string;
  title: string;
  isInverted: boolean;
}> = ({ href, title, isInverted = false }) => {
  const location = useLocation();
  const isCurrentPage = location.pathname === href;
  const lightClasses = {
    active: `text-gray-900 bg-gray-200 focus:text-gray-600`,
    inactive: `text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none`,
  };
  const darkClasses = {
    active: `text-white bg-royal-blue-800 focus:text-white`,
    inactive: `text-gray-100 hover:text-white hover:bg-royal-blue-800 focus:outline-none`,
  };
  const classes = isInverted ? darkClasses : lightClasses;
  return (
    <Link
      to={href}
      className={`mr-4 px-3 py-2 rounded text-sm font-medium focus:outline-none ${
        isCurrentPage ? classes.active : classes.inactive
      }`}
    >
      {title}
    </Link>
  );
};

export const libMenuItems = [
  { title: 'Démarrer', href: '#' },
  { title: 'Documentation', href: '#' },
  { title: 'Cartes', href: '#' },
  { title: 'Blog', href: '#' },
];

const loggedInMenuItems = [
  { title: 'Tableau de bord', href: '/dashboard' },
  { title: 'Compte', href: '/account' },
];

const anonymousMenuItems = [
  { title: 'Fonctionnalités', href: '/#features' },
  { title: 'Documentation', href: '/#docs' },
  { title: 'Equipe', href: '/#team' },
  { title: 'Blog', href: '/blog' },
];

const AuthSidebarMenu = (): JSX.Element => {
  return (
    <div>
      <Link to="/login">
        <Button
          color="lime"
          outline={false}
          size="md"
          className="inline-flex mx-1"
        >
          Se connecter
        </Button>
      </Link>
      <Link to="/signup">
        <Button
          gradientMonochrome="blue"
          outline={false}
          size="md"
          className="inline-flex mx-1"
        >
          Créer un compte
        </Button>
      </Link>
    </div>
  );
};

const NavbarMenu: React.FC<{ isInverted: boolean }> = ({ isInverted }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const menuItems =
    isAuthenticated && !isHomePage ? loggedInMenuItems : anonymousMenuItems;
  return (
    <div className="flex items-baseline ml-10">
      {menuItems.map(({ title, href }) => {
        return (
          <NavbarMenuItem
            key={title}
            href={href}
            title={title}
            isInverted={isInverted}
          />
        );
      })}
    </div>
  );
};

const SideNavigation: React.FC = () => {
  const location = useLocation();
  const isAppPage = location.pathname.startsWith('/app');
  return (
    <div className="flex-row items-center hidden md:flex">
      {!isAppPage && (
        <div>
          <Link to="/app">
            <Button className="mx-4" color={'lime'} icon={PlusIcon}>
              Créer un carte
            </Button>
          </Link>
        </div>
      )}
      <AccountDropdown />
    </div>
  );
};

type NavbarProps = {
  isFluid?: boolean;
  isInverted?: boolean;
};

const Navbar: React.FC<NavbarProps> = ({
  isFluid = false,
  isInverted = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  return (
    <nav
      className={`${
        isInverted ? 'bg-royal-blue-900 text-gray-700 body-font' : 'bg-white'
      } shadow-md z-10`}
    >
      <div className={`sm:px-6 lg:px-8 ${!isFluid && 'mx-auto max-w-7xl'}`}>
        <div className="">
          <div className="flex items-center justify-between h-16 px-4 sm:px-0">
            <div className="flex items-center">
              <LogoLink isInverted={isInverted} />
              <div className="hidden md:block">
                <NavbarMenu isInverted={isInverted} />
              </div>
            </div>
            {isAuthenticated ? <SideNavigation /> : <AuthSidebarMenu />}
            <div className="flex -mr-2 md:hidden">
              <button
                onClick={() => setIsMobileNavbarOpen(!isMobileNavbarOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-600 rounded hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:text-gray-600"
              >
                <Hamburger className="w-6 h-6" isOpen={isMobileNavbarOpen} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileNavbar
        isOpen={isMobileNavbarOpen}
        setIsMobileNavbarOpen={setIsMobileNavbarOpen}
      />
    </nav>
  );
};

export default Navbar;
