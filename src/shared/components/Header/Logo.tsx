const Logo = () => {
  return (
    <div className="logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="logo-icon"
      >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" className="logo-icon-c-2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" className="logo-icon-c-1" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" className="logo-icon-c-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" className="logo-icon-c-1" />
        <rect
          width="8"
          height="8"
          x="8"
          y="8"
          rx="1"
          className="logo-icon-c-2"
        />
      </svg>
      <div className="logo-name">
        <span className="logo-name-c-1">Pix</span>
        <span className="logo-name-c-2">Edi</span>
      </div>
    </div>
  );
};

export default Logo;
