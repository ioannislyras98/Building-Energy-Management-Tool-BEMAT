//css
import "./../css/main.css";
import "./../css/my_projects.css"

//components
import ProjectBtn from "./ProjectBtn";

//icons
import { MdOutlineAddCircle } from "react-icons/md";

export default function Home() {
    return (
        <>
            <div id="projects-wrapper" className="main-container">
                <h1 className="page-name">My Projects</h1>
                <ul id="my-projects-container">
                    <li id="add-project-button-container" className="text-center">
                        <div id="addProjectBtn" className="project-icon drop-shadow-[0_5px_15px_rgba(53,_94,_59,_0.25)]">
                            <MdOutlineAddCircle className="p-icon text-primary-light" />
                        </div>
                        <div>
                            <label className="font-bold text-primary-light">Add New Project</label>
                        </div>
                    </li>
                    {/* //edw tha mpei mia for each project pou pairnoume apo tin GET */}
                    <li>
                        <ProjectBtn
                            name={"test"}
                            buildings_count={2}
                            date_created={"28/02/2025"}
                            // method={openForm={}}
                        />
                    </li>
                </ul>
            </div>
        </>
    );
}