import { useDispatch, useSelector } from "react-redux";
import { setSelectedStrength } from "../../../state-management/More/moreSlice";
import "./StrengthsSection.css";

const GROUPS = {
    thinking: { label: "Thinking", color: "#a855f7" },
    drive: { label: "Drive", color: "#ec4899" },
    teamwork: { label: "Teamwork", color: "#f97316" },
};

const groupOf = (id) => GROUPS[id] ?? { label: id, color: "#a855f7" };

// keeps the original order, one block per group
const toGroups = (strengths) => {
    const groups = [];
    strengths.forEach((item, index) => {
        const last = groups[groups.length - 1];
        if (last && last.id === item.group) last.items.push({ item, index });
        else groups.push({ id: item.group, items: [{ item, index }] });
    });
    return groups;
};

export default function StrengthsSection() {
    const dispatch = useDispatch();
    const strengths = useSelector((state) => state.more.data.strengths);
    const selected = useSelector((state) => state.more.selectedStrength);

    const current = strengths[selected];
    const currentGroup = groupOf(current.group);

    const previewOnHover = (i) => {
        if (window.matchMedia("(hover: hover)").matches) dispatch(setSelectedStrength(i));
    };

    return (
        <div className="strengths">
            <div className="strengths-groups">
                {toGroups(strengths).map((group) => (
                    <div key={group.id}>
                        <div className="strengths-group" style={{ color: groupOf(group.id).color }}>
                            {groupOf(group.id).label}
                        </div>
                        <div className="strengths-pills">
                            {group.items.map(({ item, index }) => (
                                <button
                                    key={item.title}
                                    className={`strengths-pill${index === selected ? " on" : ""}`}
                                    onClick={() => dispatch(setSelectedStrength(index))}
                                    onMouseEnter={() => previewOnHover(index)}
                                >
                                    <span>{item.icon}</span>
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="strengths-preview" key={selected} style={{ "--c": currentGroup.color }}>
                <div className="strengths-head">
                    <span className="strengths-tag">{currentGroup.label}</span>
                    <span className="strengths-icon">{current.icon}</span>
                </div>
                <h3>{current.title}</h3>
                <p>{current.text}</p>
                <span className="strengths-count">
                    {selected + 1} / {strengths.length}
                </span>
            </div>
        </div>
    );
}