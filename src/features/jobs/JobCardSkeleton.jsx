// src/features/jobs/JobCardSkeleton.jsx
import styles from "./JobCard.module.css"; // We can reuse some styles

const skeletonStyle = {
  backgroundColor: "#e0e0e0",
  borderRadius: "4px",
  animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
};

// Add this @keyframes to your main index.css or App.css
/*
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
*/

function JobCardSkeleton() {
  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ ...skeletonStyle, height: "24px", width: "60%" }} />
      </div>
      <div
        style={{
          ...skeletonStyle,
          height: "16px",
          width: "30%",
          marginTop: "12px",
        }}
      />
      <div className={styles.tags} style={{ marginTop: "16px" }}>
        <div
          style={{
            ...skeletonStyle,
            height: "24px",
            width: "50px",
            display: "inline-block",
            marginRight: "4px",
          }}
        />
        <div
          style={{
            ...skeletonStyle,
            height: "24px",
            width: "70px",
            display: "inline-block",
          }}
        />
      </div>
    </div>
  );
}

export default JobCardSkeleton;
