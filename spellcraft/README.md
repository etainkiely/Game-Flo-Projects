# SpellCraft - Educational Spelling App

SpellCraft is an interactive, gamified spelling application designed to make learning spellings fun for children while providing parents with tracking tools.

## Features

### 🌍 Multi-Language Support
- **English** spellings with progressive difficulty
- **Irish (Gaeilge)** spellings for bilingual learning
- Easy language switching

### 📊 Level System
- 5 progressive levels per language
- Unlockable levels (complete one to unlock the next)
- Visual progress tracking
- Difficulty increases from simple 3-letter words to complex multi-syllable words

### 🎮 Gamification
- **Emoji Rewards**: Earn different emojis based on performance
  - Perfect score (100%): 🌟🏆👑💎⭐🎯🔥💯
  - Excellent (80%+): 😊🎉👏🌈✨🎊🎈
  - Good (60%+): 👍😀🙂💚💙🌸🌺
  - Keep practicing: 😌🙃😊🌼🌻

- **Device Time Rewards**: Motivation through screen time incentives
  - Perfect score: 15 minutes
  - Excellent: 10 minutes
  - Good: 5 minutes
  - Participation: 2 minutes

### 🔊 Audio Features
- **Text-to-Speech**: Words are spoken aloud using browser speech synthesis
  - English voice for English words
  - Irish voice for Irish words
  - Slower speech rate for better understanding

- **Recording Capability**: Children can record themselves spelling words
  - Practice pronunciation
  - Playback functionality
  - Fallback support for browsers without microphone access

### 📈 Parent Dashboard
- Track child's progress across all levels
- View completion percentage
- Monitor total device time earned
- See recent activity log
- Accessible via floating button

### 🎯 Learning Features
- Visual hints for each word
- Immediate feedback on answers
- Correct answer shown when mistakes are made
- Progress bar to show completion
- Celebration animations for excellent performance

## How to Use

### For Children
1. **Choose Language**: Select English or Gaeilge
2. **Select Level**: Start with Level 1 or continue where you left off
3. **Listen & Type**: 
   - Click "Play Word" to hear the word
   - Look at the hint
   - Type the spelling
   - Click "Check" or press Enter
4. **Practice Recording** (optional):
   - Record yourself spelling the words
   - Listen to your recording
5. **Earn Rewards**: Complete the level to see your score and rewards!

### For Parents
1. Click the "Parent Dashboard" button in the bottom right
2. View your child's progress and statistics
3. Monitor device time earned
4. Check recent activity

## Technical Details

### Browser Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- For audio recording: microphone access permission
- For text-to-speech: Browser must support Web Speech API

### Storage
- Uses browser's localStorage to save:
  - Completed levels
  - Language preference
  - Device time earned
  - Activity log

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Touch-friendly interface
- Adaptive layout for different screen sizes

## Word Lists

### English Levels
- **Level 1**: Basic 3-letter words (cat, dog, sun, tree, book)
- **Level 2**: Simple 4-5 letter words (house, water, happy, table, green)
- **Level 3**: Medium difficulty words (beautiful, elephant, butterfly, computer, rainbow)
- **Level 4**: Advanced words (excellent, adventure, mysterious, wonderful, celebrate)
- **Level 5**: Complex words (encyclopedia, magnificent, extraordinary, mathematics, imagination)

### Irish (Gaeilge) Levels
- **Level 1**: Basic words (cat, madra, teach, bord, leabhar)
- **Level 2**: Common words (scoil, uisce, grian, crann, cara)
- **Level 3**: Everyday words (peileacán, teilifís, leabharlann, aimsir, ceolchoirm)
- **Level 4**: Intermediate words (taithneamhach, eagarthóir, meaisín, ranganna, ealaíontóir)
- **Level 5**: Advanced words (réalteolaíocht, stair-sheandálaíocht, comhshaol, teicneolaíocht, ríomhaireacht)

## Customization

### Adding Your Own Words
You can easily add custom word lists by uploading a JSON file with the following structure:

```json
{
  "language": "english",
  "level": 6,
  "words": [
    { "word": "example", "hint": "A sample or illustration" },
    { "word": "practice", "hint": "Repeated exercise to improve" }
  ]
}
```

## Privacy & Data
- All data is stored locally in the browser
- No data is sent to external servers
- No accounts or personal information required
- Safe and private learning environment

## Future Enhancements
- Import custom word lists
- Multiple difficulty modes
- Timed challenges
- Multiplayer mode
- More languages
- Print certificates of achievement
- Export progress reports

## Credits
Developed for educational purposes to support children's literacy in both English and Irish.

## License
Educational use - Free to use and modify for personal and educational purposes.
