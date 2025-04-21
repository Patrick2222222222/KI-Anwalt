import { useState } from 'react';
import styles from '../styles/Forum.module.css';
import Link from 'next/link';

export default function ForumPost({ post }) {
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      // In a real implementation, this would make an API call to update the like count
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Aktueller Nutzer',
        content: newComment,
        date: new Date().toLocaleDateString('de-DE')
      };
      setComments([...comments, comment]);
      setNewComment('');
      // In a real implementation, this would make an API call to add the comment
    }
  };

  return (
    <div className={styles.forumPost}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{post.author}</h3>
            <span className={styles.postDate}>{post.date}</span>
          </div>
        </div>
        <div className={styles.postCategory}>
          <span>{post.category}</span>
        </div>
      </div>
      
      <div className={styles.postContent}>
        <h2>{post.title}</h2>
        <p>{post.content}</p>
      </div>
      
      <div className={styles.aiResponse}>
        <div className={styles.aiResponseHeader}>
          <div className={styles.aiAvatar}>
            <i className="fas fa-robot"></i>
          </div>
          <h3>KI-Einschätzung</h3>
        </div>
        
        <div className={styles.aiResponseContent}>
          {showFullResponse ? (
            <p>{post.aiResponse}</p>
          ) : (
            <p>{post.aiResponse.substring(0, 200)}... <button 
              className={styles.readMoreButton}
              onClick={() => setShowFullResponse(true)}
            >
              Weiterlesen
            </button></p>
          )}
        </div>
      </div>
      
      <div className={styles.postActions}>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.actionButton} ${hasLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            <i className="fas fa-thumbs-up"></i>
            <span>{likes} Likes</span>
          </button>
          
          <button className={styles.actionButton}>
            <i className="fas fa-comment"></i>
            <span>{comments.length} Kommentare</span>
          </button>
        </div>
        
        <Link href={`/payment/checkout?case_id=${post.id}`} className={styles.upgradeButton}>
          <i className="fas fa-file-alt"></i>
          <span>Detaillierte Analyse für 4,99€</span>
        </Link>
      </div>
      
      <div className={styles.commentsSection}>
        <h3>Kommentare</h3>
        
        <form className={styles.commentForm} onSubmit={handleAddComment}>
          <input 
            type="text" 
            placeholder="Schreiben Sie einen Kommentar..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.userAvatar}>
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{comment.author}</h4>
                  <span className={styles.commentDate}>{comment.date}</span>
                </div>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
