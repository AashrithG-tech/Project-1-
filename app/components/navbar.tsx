import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="font-bold text-gradient text-2xl">RESUMIND</p>
            </Link>
            <Link to="/upload" className="primaryButton w-fit">
                Upload Resume
            </Link>

        </nav>
    )
}

export default Navbar