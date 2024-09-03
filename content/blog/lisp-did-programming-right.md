+++
title = "Common Lisp - How Lisp did Programming Right" 
description = "What Common Lisp did right and why it's still a programmer's best friend" 
date = 2024-09-02
+++

Lisp short for the List Processing Language, is viewed as a relic in today's
day and age. This is for a multitude of reasons, some that I would personally
attribute to general age, lack of "nice" IDE support, and a less imperative
programming style. Nonetheless, even if parentheses aren't your favorite they
simplify a lot of things, so bare with me.

Lisp is both functional and object-oriented. And if you so desire you can
write your own language with it by descending into macro hell. But there
are some fundamental successes in Lisp that some popular languages today
fail to achieve. So let's talk about those.

1. REPL Driven Development
2. Explicit Order Of Operations
3. First-Class Functions
4. Significant Interpreted Runtime Efficiency

Some of these are obviously understood, but the REPL, which in my opinion
is briliant. The REPL stand for Read-Eval-Print-Loop, many languages have such
a construct, but often they are an afterthought. In Lisp, the REPL is your IDE.
Fundamentally, this is why Lisp doesn't need fancy IDEs.

Most Lisp users just use Emacs, because SLIME is pretty great. You write code in
one pane and evaluate it in the other. The relatively cohesive work flow here
translate straight into "compiling" your binary. Lisp is a really old language
so you can technically compile it or interpret it or bundle it with the runtime.

Of the many different kinds of "compilers" that have been implemented SBCL is the
most popular free compiler and it really just bundles your Lisp application with
your implementation of SBCL. I like to think of this kind of like how jPackage bundles
the JVM with your Java classes but in this case it's easier because all your Lisp gets
baked into the resulting which is roughly SBCL sized.

This might seem bad at first, but it's actually pretty cool because with every Lisp
application you get built-in debugging facilities. NASA purportedly debugged a really
old program on one of their satellites by using the built-in debugger into which their old
software had failed. In my opinion, that's a lot more valuable than breakpoints or test
driven development. What's really cool, in order to correct errors you can just evaluate
a new valid Lisp form in place of the misinterpreted Lisp code.

The function syntax in my opinion appeals to my personal idiosynchrasies by quickly
evaluating all forms in parentheses as functions. Mathematically this makes sense
because although we typically use infix notation for basic operations like `2 + 3`, we can
express these operations in functional notation like so `(+ 2 3)`. Chaining more functions
together allows us to much more quickly evaluate order of operations.

Ultimately, I think many of these design principles ought to be considered when building new
languages. I think Data Scientists got pretty close with their notebooks, but moving to deployment
with their notebooks is still a pain point. Evidently, sometimes the old ways are the best ways!

