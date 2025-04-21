import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/ForumPostDetail.module.css';

export default function ForumPostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  // Mock data for demonstration
  const post = {
    id: id,
    title: 'Mieterhöhung nach Modernisierung',
    category: 'Mietrecht',
    content: 'Mein Vermieter hat eine energetische Sanierung durchgeführt und möchte nun die Miete um 15% erhöhen. Ist das rechtens? Die Maßnahmen umfassten eine neue Fassadendämmung, den Austausch der Fenster und eine neue Heizungsanlage. Die Arbeiten wurden vor 2 Monaten abgeschlossen.',
    author: {
      name: 'Max Mustermann',
      initials: 'MM'
    },
    date: '15. April 2025',
    likes: 24,
    views: 142,
    comments: 8,
    aiResponse: 'Nach § 559 BGB darf der Vermieter nach Modernisierungsmaßnahmen die jährliche Miete um bis zu 8% der für die Wohnung aufgewendeten Kosten erhöhen. Eine energetische Sanierung gilt als Modernisierung. Die Erhöhung um 15% erscheint daher auf den ersten Blick zu hoch, sofern sie sich auf die Jahresmiete bezieht. Wichtig ist auch, dass der Vermieter die Modernisierung korrekt angekündigt hat und die Berechnung der Umlage nachvollziehbar darlegt.'
  };
  
  const relatedPosts = [
    { id: '2', title: 'Nebenkostenabrechnung verspätet erhalten', date: '10. April 2025' },
    { id: '3', title: 'Kündigung wegen Eigenbedarf', date: '5. April 2025' },
    { id: '4', title: 'Mietminderung bei Schimmel', date: '1. April 2025' }
  ];
  
  const lawyers = [
    { id: '1', name: 'Dr. Anna Schmidt', initials: 'AS', rating: 4.8, reviews: 42, location: 'Berlin' },
    { id: '2', name: 'Thomas Weber', initials: 'TW', rating: 4.6, reviews: 28, location: 'München' },
    { id: '3', name: 'Julia Becker', initials: 'JB', rating: 4.9, reviews: 37, location: 'Hamburg' }
  ];
  
  const comments = [
    { 
      id: '1', 
      author: 'Laura K.', 
      date: '16. April 2025', 
      content: 'Ich hatte einen ähnlichen Fall. Bei mir wurde die Mieterhöhung auf 8% der Modernisierungskosten begrenzt. Wichtig ist, dass der Vermieter die Kosten detailliert aufschlüsselt.' 
    },
    { 
      id: '2', 
      author: 'Michael S.', 
      date: '16. April 2025', 
      content: 'Achte auch darauf, ob reine Instandhaltungsmaßnahmen dabei sind. Diese dürfen nicht auf die Miete umgelegt werden, sondern nur echte Modernisierungen.' 
    }
  ];
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the comment to the server
    alert('Kommentar würde gesendet: ' + comment);
    setComment('');
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Head>
        <title>{post.title} | lawmaster24.com Forum</title>
      </Head>
      
      <div className={styles.postDetailContainer}>
        <div className={styles.breadcrumbs}>
          <a href="/forum">
            <i className="fas fa-arrow-left"></i> Zurück zum Forum
          </a>
        </div>
        
        <div className={styles.postDetail}>
          <div className={styles.postHeader}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>{post.author.initials}</div>
              <div>
                <h3>{post.author.name}</h3>
                <div className={styles.postDate}>{post.date}</div>
              </div>
            </div>
            <div className={styles.postCategory}>{post.category}</div>
          </div>
          
          <div className={styles.postContent}>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
          </div>
          
          <div className={styles.aiResponse}>
            <div className={styles.aiResponseHeader}>
              <div className={styles.aiAvatar}>AI</div>
              <h3>Rechtliche Einschätzung (KI)</h3>
            </div>
            <div className={styles.aiResponseContent}>
              <p>{post.aiResponse}</p>
            </div>
          </div>
          
          <div className={styles.postActions}>
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                onClick={toggleLike}
              >
                <i className={`fas fa-thumbs-up`}></i> {isLiked ? post.likes + 1 : post.likes}
              </button>
              <button className={styles.actionButton}>
                <i className="fas fa-comment"></i> {post.comments}
              </button>
              <button className={styles.actionButton}>
                <i className="fas fa-share"></i> Teilen
              </button>
            </div>
            
            <a href="/payment/checkout" className={styles.upgradeButton}>
              <i className="fas fa-crown"></i> Detaillierte Analyse für 4,99€
            </a>
          </div>
        </div>
        
        <div className={styles.relatedInfo}>
          <div className={styles.infoCard}>
            <h3>Ähnliche Fragen</h3>
            <ul className={styles.relatedPosts}>
              {relatedPosts.map(post => (
                <li key={post.id}>
                  <a href={`/forum/${post.id}`}>{post.title}</a>
                  <span>{post.date}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Passende Anwälte</h3>
            <div className={styles.lawyersList}>
              {lawyers.map(lawyer => (
                <div key={lawyer.id} className={styles.lawyerCard}>
                  <div className={styles.lawyerAvatar}>{lawyer.initials}</div>
                  <div className={styles.lawyerInfo}>
                    <h4>{lawyer.name}</h4>
                    <div className={styles.lawyerRating}>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                      <span>{lawyer.rating} ({lawyer.reviews})</span>
                    </div>
                    <div className={styles.lawyerLocation}>{lawyer.location}</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="/find-lawyer" className={styles.findMoreLink}>
              Mehr Anwälte finden <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
        
        <div className={styles.commentsSection}>
          <h2>Kommentare ({comments.length})</h2>
          
          <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <input 
              type="text" 
              placeholder="Schreiben Sie einen Kommentar..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          
          <div className={styles.commentsList}>
            {comments.map(comment => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <h4>{comment.author}</h4>
                  <div className={styles.commentDate}>{comment.date}</div>
                </div>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
