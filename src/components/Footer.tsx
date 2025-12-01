const Footer = () => {
  return (
    <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-['Space_Grotesk'] text-xl font-bold mb-2">Sohit Kumar</p>
            <p className="text-primary-foreground/60">Senior Product Manager</p>
            <p className="text-primary-foreground/60 text-sm mt-1">Noida, India</p>
          </div>
          
          <div className="text-center md:text-right text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Sohit Kumar. All rights reserved.</p>
            <p className="text-sm mt-1">Building products that matter</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
