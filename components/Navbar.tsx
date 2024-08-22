import Circle from "./ui/Circle"


export const Navbar=()=>{
    return(
        <div className="flex flex-row justify-between">
            <div className="text-3xl font-extrabold text-primary">
                CrytpoNest
            </div>
            <div className="flex-col text-2xl">
                <Circle text={"PD"} />
            </div>
        </div>
    )
}