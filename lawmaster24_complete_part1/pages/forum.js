import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ForumPost from '../components/ForumPost';
import styles from '../styles/ForumPage.module.css';

export default function Forum() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Mock data for forum posts
  const mockPosts = [
    {
      id: 1,
      author: 'Max Mustermann',
      date: '15.04.2025',
      category: 'Mietrecht',
      title: 'Mieterhöhung nach Modernisierung - ist das rechtens?',
      content: 'Mein Vermieter hat eine energetische Sanierung durchgeführt und möchte nun die Miete um 15% erhöhen. Die Arbeiten umfassten eine neue Fassadendämmung und den Austausch der Fenster. Ist eine solche Erhöhung rechtmäßig? Ich wohne seit 8 Jahren in der Wohnung und bisher gab es nur die üblichen Mietanpassungen gemäß Mietspiegel.',
      aiResponse: 'Nach § 559 BGB darf der Vermieter nach Modernisierungsmaßnahmen die jährliche Miete um bis zu 8% der für die Wohnung aufgewendeten Kosten erhöhen. Eine energetische Sanierung gilt als Modernisierung. Die Erhöhung um 15% erscheint daher auf den ersten Blick zu hoch, sofern sie sich auf die Jahresmiete bezieht. Wichtig ist auch, dass der Vermieter die Modernisierung korrekt angekündigt hat und die Berechnung der Umlage nachvollziehbar darlegt. Prüfen Sie das Erhöhungsschreiben auf diese Punkte. Für eine detaillierte Analyse und ein mögliches Antwortschreiben empfehle ich eine vollständige rechtliche Prüfung.',
      likes: 24,
      comments: [
        {
          id: 101,
          author: 'Laura Schmidt',
          content: 'Hatte einen ähnlichen Fall. Bei mir waren es 10% und selbst das war zu viel. Habe erfolgreich widersprochen!',
          date: '16.04.2025'
        },
        {
          id: 102,
          author: 'Thomas Weber',
          content: 'Wichtig ist auch zu prüfen, ob wirklich alle Kosten umlagefähig sind. Oft werden Instandhaltungsmaßnahmen als Modernisierung deklariert.',
          date: '16.04.2025'
        }
      ]
    },
    {
      id: 2,
      author: 'Julia Becker',
      date: '14.04.2025',
      category: 'Arbeitsrecht',
      title: 'Kündigung während der Probezeit ohne Angabe von Gründen',
      content: 'Ich wurde nach 2 Monaten in der Probezeit gekündigt, ohne dass mir Gründe genannt wurden. Vorher gab es keine Beschwerden über meine Arbeit, im Gegenteil, ich bekam sogar positives Feedback. Kann ich gegen diese Kündigung vorgehen oder zumindest eine Begründung verlangen? Die Kündigungsfrist von 2 Wochen wurde eingehalten.',
      aiResponse: 'In der Probezeit, die maximal 6 Monate betragen darf, gilt eine verkürzte Kündigungsfrist von zwei Wochen (§ 622 Abs. 3 BGB). Der Arbeitgeber muss grundsätzlich keinen Grund für die Kündigung während der Probezeit angeben, da der Zweck der Probezeit gerade darin besteht, die Eignung des Arbeitnehmers zu testen. Eine Begründungspflicht besteht nicht. Allerdings darf die Kündigung nicht diskriminierend sein (AGG) oder gegen Treu und Glauben verstoßen. Wenn Sie den Verdacht haben, dass die Kündigung aus diskriminierenden Gründen erfolgte (z.B. wegen Geschlecht, Alter, Religion), könnten Sie rechtliche Schritte erwägen. Für eine vollständige Bewertung Ihrer Situation und mögliche Handlungsoptionen empfehle ich eine detaillierte rechtliche Analyse.',
      likes: 18,
      comments: [
        {
          id: 201,
          author: 'Markus Schneider',
          content: 'Leider ist das in der Probezeit so üblich. Hatte einen ähnlichen Fall und konnte nichts machen.',
          date: '15.04.2025'
        }
      ]
    },
    {
      id: 3,
      author: 'Stefan Hoffmann',
      date: '13.04.2025',
      category: 'Familienrecht',
      title: 'Umgangsrecht mit meinen Kindern nach Trennung',
      content: 'Meine Frau und ich haben uns vor einem Monat getrennt. Wir haben zwei Kinder (5 und 7 Jahre). Bisher konnte ich die Kinder jedes Wochenende sehen, nun möchte meine Frau dies auf jedes zweite Wochenende reduzieren ohne Begründung. Wir waren immer beide berufstätig und haben uns die Kinderbetreuung geteilt. Wie sind meine Rechte in dieser Situation?',
      aiResponse: 'Als Vater haben Sie ein Recht auf regelmäßigen Umgang mit Ihren Kindern, unabhängig vom Sorgerecht (§ 1684 BGB). Das Umgangsrecht dient dem Wohl der Kinder und soll die Bindung zu beiden Elternteilen fördern. Bei der Festlegung der Umgangsregelung steht das Kindeswohl im Mittelpunkt. Ein Umgang an jedem zweiten Wochenende ist zwar eine häufige Regelung, aber wenn Sie vorher intensiver in die Betreuung eingebunden waren, kann auch ein umfangreicherer Umgang angemessen sein. Ich empfehle zunächst ein Gespräch mit Ihrer Ex-Partnerin, eventuell mit Unterstützung einer Familienmediationsstelle. Sollte keine Einigung möglich sein, können Sie beim Familiengericht einen Antrag auf Regelung des Umgangs stellen. Für eine individuelle Beratung zu Ihrer spezifischen Situation und Unterstützung bei der Antragstellung empfehle ich eine ausführliche rechtliche Analyse.',
      likes: 32,
      comments: [
        {
          id: 301,
          author: 'Anna Müller',
          content: 'Versuchen Sie unbedingt eine einvernehmliche Lösung zu finden. Gerichtsverfahren sind für alle Beteiligten, besonders für die Kinder, belastend.',
          date: '14.04.2025'
        },
        {
          id: 302,
          author: 'Michael Wagner',
          content: 'War in einer ähnlichen Situation. Eine Mediation hat uns sehr geholfen, eine gute Lösung für alle zu finden.',
          date: '14.04.2025'
        },
        {
          id: 303,
          author: 'Claudia Bauer',
          content: 'Dokumentieren Sie alle Gespräche und Vereinbarungen schriftlich, das hilft später falls es doch zu einem Gerichtsverfahren kommt.',
          date: '15.04.2025'
        }
      ]
    }
  ];
  
  // Filter posts based on active category
  const filteredPosts = activeCategory === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.category === activeCategory);
  
  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      // Simple date comparison (in a real app, use proper date objects)
      return new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-'));
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else if (sortBy === 'comments') {
      return b.comments.length - a.comments.length;
    }
    return 0;
  });
  
  // List of legal categories
  const categories = [
    { id: 'all', name: 'Alle Kategorien' },
    { id: 'Mietrecht', name: 'Mietrecht' },
    { id: 'Arbeitsrecht', name: 'Arbeitsrecht' },
    { id: 'Familienrecht', name: 'Familienrecht' },
    { id: 'Verkehrsrecht', name: 'Verkehrsrecht' },
    { id: 'Vertragsrecht', name: 'Vertragsrecht' },
    { id: 'Erbrecht', name: 'Erbrecht' },
    { id: 'Strafrecht', name: 'Strafrecht' }
  ];

  return (
    <Layout>
      <Head>
        <title>Rechtsforum | lawmaster24.com</title>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      
      <div className={styles.forumContainer}>
        <div className={styles.forumHeader}>
          <h1>Rechtsforum</h1>
          <p>Stellen Sie Ihre rechtliche Frage und erhalten Sie eine kostenlose KI-Einschätzung</p>
          
          <button className={styles.newPostButton}>
            <i className="fas fa-plus"></i>
            <span>Neue Frage stellen</span>
          </button>
        </div>
        
        <div className={styles.forumControls}>
          <div className={styles.categoryFilter}>
            <div className={styles.categoryTabs}>
              {categories.map(category => (
                <button 
                  key={category.id}
                  className={activeCategory === category.id ? styles.active : ''}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.sortOptions}>
            <label>Sortieren nach:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Neueste</option>
              <option value="popular">Beliebteste</option>
              <option value="comments">Meiste Kommentare</option>
            </select>
          </div>
        </div>
        
        <div className={styles.forumPosts}>
          {sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
              <ForumPost key={post.id} post={post} />
            ))
          ) : (
            <div className={styles.noPosts}>
              <i className="fas fa-search"></i>
              <p>Keine Beiträge in dieser Kategorie gefunden.</p>
              <button className={styles.newPostButton}>
                <i className="fas fa-plus"></i>
                <span>Erste Frage stellen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
