const Container = (props) => {
  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      {props.children}
    </div>
  );
};

export default Container;