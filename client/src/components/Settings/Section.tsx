import SettingItem from "./SettingsItem";

const Section = ({ title, items }: any) => {
  return (
    <div>
      <h3 className="text-lg font-bold px-4 pt-4 pb-2">{title}</h3>
      {items.map((item: any, idx: number) => (
        <SettingItem
          key={idx}
          {...item}
        />
      ))}
    </div>
  );
};

export default Section;
