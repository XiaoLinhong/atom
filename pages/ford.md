title: 第三章 文档生成
---

### 简介
写文档一直都是程序员的噩梦，特别是在word文档里面编辑。

代码总是确定性的描述，而文字则是充满了歧义。当时看代码总是痛苦的，因为代码是给编译器看的，所以我们一定是需要文档的。

如何减少写文档的痛苦，当前的最佳文档实践方式是在实现代码的同时，在代码的相同位置，以注释的方式去进行文档的编写。

这样就引申出一个需求，如何把代码文件（一般为文本文件）中的以注释编辑的文档，以更加漂亮可读的方式呈现出来。

这就是文档自动生成工具的由来，而目前最好的为fortran而生的文档生成工具就是[ford](https://github.com/Fortran-FOSS-Programmers/ford)

ford采用[Markdown](https://markdown.com.cn/)来编写纯文本格式的文档。

ford的使用非常简单，只需要在代码仓的主目录中输入``` ford proj.md ```即可在当前目录产生HTML格式的文档，简单来说，ford会从```proj.md```（命名方式并不固定）读取一些代码仓的元数据信息（比如作者名称，简洁等等，也包含ford的一些配置信息），同时会解析代码仓主目录下的```src/*[fF]90```代码文件，会形成相关的链接结构（方便进行跳转）。当然ford也会额外的抽取一些特殊的注释文档，在后续会详细介绍。

### 在代码中编写文档
如果在写Fortran时，不写专门的文档注释，那么ford只是简单的把源代码（```*.f90```）、代码中的模块（```Module```）和模块中的过程体（```Module```）和模块中的一些独立单元（```subroutine, function, type```）和入口函数（```program```）解析出来，并形成链接。如果我们要告诉ford，对于某个对象，你应该额外的抽出一些注释，我们应该怎么做呢？

用双感叹号``` !! ```来告诉ford（这个符号可以改变，但是一般来说没有必要），这是文档注释。而ford会忽略掉普通的感叹号```!```注释。 文档注释应该在标注代码之后（有些人喜欢在函数定义的前面写函数的注释，通过特殊的标注``` !> ```也是可以支持的，不过不建议这样去做）。 

```fortran
subroutine demo(cats, dogs, food, angry)
    !! Feeds your cats and dogs, if enough food is available. If not enough
    !! food is available, some of your pets will get angry.

    ! Arguments
    integer, intent(in)  :: cats
        !! The number of cats to keep track of.
    integer, intent(in)  :: dogs
        !! The number of dogs to keep track of.
    real, intent(inout)  :: food
        !! The ammount of pet food (in kilograms) which you have on hand.
    integer, intent(out) :: angry
        !! The number of pets angry because they weren't fed.

    return
end subroutine demo
```

对于比较长的文档块，可以使用``` !* ```作为第一条文档的注释。


### 注意实现
在用ford生成静态网页时，加上-o选项，指定输出的目录
```
ford atom.md -o docs
```

@note
1. [ford手册](https://forddocs.readthedocs.io/en/latest/user_guide/getting_started.html)
@endnote

