# Use auto reply bot from command

Basic command

```bash
# list commands
@AutoReplyBot help

# list keywords and replies
@AutoReplyBot list

# delete keywords and replies
@AutoReplyBot rm {id}

# disable auto reply
@AutoReplyBot off

# enable auto reply
@AutoReplyBot on

# disable signature in auto reply
@AutoReplyBot signatureOff

# enable signature in auto reply
@AutoReplyBot signatureOn

# test if some message would trigger auto reply
@AutoReplyBot test some-message

# add new keywords and replies

# {cmd}, string, required, command name, could be "add", "new", or "create", all the same
# {keywordSeprateByComma} keywords list, seprate by comma. by default it is wild card match, means if message has keyword in it would trigger reply,
# Use double quote keyword would require full match to trigger reply

# {reply}, string, when message has keywords, would reply with this.
@AutoReplyBot {cmd} keywords='keywordSeprateByComma' {reply}
```

Examples:

```bash
# most simple: one wildcard keyword, any message with "name" in it would trigger reply with "Drake Zhao"
@AutoReplyBot add keywords='name' Drake Zhao

# full match: any message must equals "age" would trigger reply with "40"
@AutoReplyBot add keywords='age' 40

# multi keywords
@AutoReplyBot add keywords='"age", your age, how old are you' 40

# list commands
@AutoReplyBot help

# list keywords and replies
@AutoReplyBot list

# delete keywords and replies
@AutoReplyBot rm someidlisted

# disable auto reply
@AutoReplyBot off

# enable auto reply
@AutoReplyBot on

# disable signature in auto reply
@AutoReplyBot signatureOff

# enable signature in auto reply
@AutoReplyBot signatureOn

# test if some message would trigger auto reply
@AutoReplyBot test some-message

```
