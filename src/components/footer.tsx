export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        <p className="text-sm text-mauve-10">
          &copy; {currentYear} Spruce Emmanuel. All rights reserved.
        </p>
      </div>

      <div className="flex gap-4 space-x-4">
        <a
          href="https://github.com/iamspruce"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mauve-11 hover:text-purple-9"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/spruceemma"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mauve-11 hover:text-purple-9"
        >
          LinkedIn
        </a>
        <a
          href="mailto:Rspruceemmanuel@gmail.com"
          className="text-mauve-11 hover:text-purple-9"
        >
          Email
        </a>
      </div>
    </footer>
  );
}
