category-id should not be equal to
- status
- rule-*

all ids (category and rule) should not contain spaces

category-id should be in allowed categories-array (see 'constants.js')
all categories must be unique (e.g. no double category key)

alles rules should have an id
all rules must have a description
descriptions should start with a capital (?)
all rules must contain at least [css, ...?]
rule id's must be unique

filename must be [valid host].json

there should be an accompanying test file

css rules should be unique (else they might be removed when a duplicate is removed)
css rules of the form '<something> { display: none; }' should give a warning to move to 'hide' for clarity (also to prevent effectively a duplicate with css rule)

maybe:
- alfabetic order? (for categories? For rules?)
