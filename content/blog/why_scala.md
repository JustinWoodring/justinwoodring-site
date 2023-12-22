+++
title = "Why Scala: The Coder's Swiss Army Knife"
description = "A post-mortem analysis of the death of Scala's hype"
date = 2023-10-12
+++

Scala. The heyday of this language has come and gone. Yet despite a seemingly strong public
distaste, there is an ineffable glimmer to this language. Something about it calls to an
intellectual nature. At face value, it seems as though Scala is just another failed "better java"
with so many esoteric language constructs that it's difficult to grasp. A lot of people will say
Kotlin is better. But then again those people might just be wrong.

In my opinion, Scala is the most 'powerful' language I've ever come across. The language itself is 
presented as a mesmerizing clash and harmony between object-oriented and functional paradigms unlike
anything else I've seen. People who effectively wield this dualistic nature might as well be using the
"Force" or "One Power" while everyone else is playing with swords. 

In more grounded terms, Scala for the experienced user can quickly be used to solve the most complex
problems simply and for inexperienced users can lead them down hopelessly winding paths of antipatterns
and senseless complexity. But that is it's namesake, Scala, the scalable language. It can be adapted
to solve any problem. But its greatest strength is its weakness in that it's easy to write horrifically
bad code and can take a long time to properly wield.

Consider this FizzBuzz code:
```scala
for i <- 1 until 100 do println(
    i match
        case i if i % 3 == 0 && i % 5 == 0 => "FizzBuzz"
        case i if i % 3 == 0 => "Fizz"
        case i if i % 5 == 0 => "Buzz"
        case i => i
)
```

This sample is incredibly expressive and quite simple to understand. But the number of complex concepts that must
be understood to write that code far outnumber the equivalent barbaric Java:

```java
for (int i = 1; i <= n; i++)   {  
  if (i%3==0 && i%5==0) {   
      System.out.print("FizzBuzz");  
  } 
  else if (i%3==0) {  
      System.out.print("Fizz");  
  }   
  else if (i%5==0) {   
    System.out.print("Buzz");  
  }   
  else  {  
    System.out.print(i);  
  }
}
```

None of this is to say you that couldn't write the barbaric format in Scala, but what I am saying is that Scala offers
a higher path. A higher path that could easily be ignored because Scala still lets you code a solution like a
stone-age trogolodyte. That's where the difficulty comes in. And frankly in my opinion it's the primary reason
that Scala is considered an arcane magic and companies prefer to use a language like Go with concepts so simple
a monkey could code in it. Because it's just that, companies and people don't want to solve problems well when they
can simply solve problems good enough and it's easy for everyone (even the new intern) to understand.

For a list of actual things Scala can be used to do:
- It runs on the JVM, Javascript, or natively. 
- You can program in functional and object-oriented paradigms.
- It supports inferred static typing, so it can used for scripting or building a huge enterprise application.
- It supports both immutable and mutable programming.
- Natively you can even choose to forego the garbage collector and handle that yourself.
- You can also export functionality back to the various respective platforms and packages.
- And for scripting purposes you can run it in a jupyter notebook or like a shell script equivalent to python or bash.
- It has complex pattern matching support.
- It also supports sophisticated for comprehensions.

The above is a summary of the most notable aspects about the language but frankly there's a lot more I didn't even list.
So my rationale for why Scala will never be mainstream is because it's too hard for the normies, but if you're cool
and you "Use Arch Btw" or are similarly inclined as a power user. Then you should use Scala, because your brain might
hurt sometimes but Scala is an academic exercise in designing the most powerful language we've seen yet and it's the closest
anyone will ever get to being a 10x developer (if such a thing were possible). It was also created
in Switzerland which makes the fact that language is basically a swiss army knife pretty mordant.
