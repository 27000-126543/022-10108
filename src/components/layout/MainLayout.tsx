
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const MainLayout = ({ title, subtitle, children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
