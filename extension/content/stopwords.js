// English and German stopwords, including YouTube-specific terms
window.stopwords = new Set([
  // English stopwords
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
  'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',

  // German stopwords
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'sich', 'mein', 'dein', 'sein', 'unser', 'euer', 'ihr',
  'mich', 'dich', 'ihn', 'uns', 'euch', 'meine', 'deine', 'seine', 'meinen', 'deinen', 'seinen', 'meinem',
  'deinem', 'seinem', 'eines', 'keines', 'einer', 'keiner', 'einem', 'keinem', 'einen', 'keinen', 'der', 'die',
  'das', 'dass', 'daß', 'und', 'oder', 'als', 'wenn', 'wann', 'warum', 'wie', 'wo', 'was', 'wer', 'wen', 'wem',
  'wessen', 'ein', 'eine', 'einen', 'einem', 'eines', 'kein', 'keine', 'keinen', 'keinem', 'keines', 'nicht',
  'von', 'zu', 'mit', 'bei', 'nach', 'vor', 'hinter', 'über', 'unter', 'neben', 'an', 'in', 'auf', 'aus',
  'für', 'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden', 'habe', 'hast', 'hat', 'haben',
  'hatte', 'hatten', 'kann', 'können', 'konnte', 'konnten', 'soll', 'sollen', 'sollte', 'sollten', 'will',
  'wollen', 'wollte', 'wollten', 'muss', 'müssen', 'musste', 'mussten', 'darf', 'dürfen', 'durfte', 'durften',

  // Additional German words
  'den', 'dem', 'des', 'denen', 'deren', 'dessen', 'diese', 'dieser', 'dieses', 'diesen', 'diesem', 'jene',
  'jener', 'jenes', 'jenen', 'jenem', 'solche', 'solcher', 'solches', 'solchen', 'solchem', 'welche', 'welcher',
  'welches', 'welchen', 'welchem', 'manche', 'mancher', 'manches', 'manchen', 'manchem', 'alle', 'aller', 'alles',
  'allen', 'allem', 'beide', 'beider', 'beides', 'beiden', 'beidem', 'keine', 'keiner', 'keines', 'keinen', 'keinem',

  // YouTube-specific terms
  'video', 'videos', 'channel', 'channels', 'subscribe', 'subscribed', 'subscriber', 'subscribers', 'like', 'likes',
  'dislike', 'dislikes', 'comment', 'comments', 'watch', 'watching', 'watched', 'view', 'views', 'viewer', 'viewers',
  'play', 'plays', 'playing', 'played', 'upload', 'uploads', 'uploaded', 'uploading', 'stream', 'streams', 'streaming',
  'streamed', 'live', 'lives', 'lived', 'livestream', 'livestreams', 'livestreaming', 'livestreamed', 'share', 'shares',
  'shared', 'sharing', 'follow', 'follows', 'following', 'followed', 'follower', 'followers', 'notification', 'notifications',
  'notify', 'notifies', 'notified', 'notifying', 'bell', 'bells', 'ring', 'rings', 'ringing', 'rung', 'ringed',

  // Common internet/social media terms
  'click', 'clicks', 'clicked', 'clicking', 'link', 'links', 'linked', 'linking', 'post', 'posts', 'posted', 'posting',
  'share', 'shares', 'shared', 'sharing', 'tag', 'tags', 'tagged', 'tagging', 'mention', 'mentions', 'mentioned',
  'mentioning', 'reply', 'replies', 'replied', 'replying', 'retweet', 'retweets', 'retweeted', 'retweeting', 'dm',
  'dms', 'message', 'messages', 'messaged', 'messaging', 'chat', 'chats', 'chatted', 'chatting', 'send', 'sends',
  'sent', 'sending', 'receive', 'receives', 'received', 'receiving', 'forward', 'forwards', 'forwarded', 'forwarding',

  // Common symbols and numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '&', '@', '#', '$', '%', '^', '*', '(', ')', '-', '_', '+', '=', '{', '}', '[', ']', '|', '\\', ':', ';', '"', "'",
  '<', '>', ',', '.', '?', '/', '~', '`', '!',

  // Common time-related words
  'today', 'yesterday', 'tomorrow', 'now', 'later', 'earlier', 'before', 'after', 'during', 'while', 'when', 'then',
  'ago', 'next', 'last', 'current', 'previous', 'recent', 'upcoming', 'scheduled', 'planned', 'expected', 'estimated',
  'heute', 'gestern', 'morgen', 'jetzt', 'später', 'früher', 'vorher', 'nachher', 'während', 'wann', 'dann', 'vor',
  'nächste', 'letzte', 'aktuelle', 'vorherige', 'kürzlich', 'kommende', 'geplant', 'erwartet', 'geschätzt'
]);
