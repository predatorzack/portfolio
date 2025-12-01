const Footer = () => {
  return (
    <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-['Space_Grotesk'] text-xl font-bold mb-2">Alex Rivera</p>
            <p className="text-primary-foreground/60">Creative Developer & Designer</p>
          </div>
          
          <div className="text-center md:text-right text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
            <p className="text-sm mt-1">Built with passion and React</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
