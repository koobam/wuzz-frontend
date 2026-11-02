//
//  Use this file to import your target's public headers that you would like to
//  expose to Swift.
//
//  Importing the Obj-C facade for NitroAutoPrefetcher avoids pulling in the
//  pod's C++ surface (HttpHeader.hpp, jsi.h, etc.), which would otherwise
//  fail Clang's dependency scanner when AppDelegate.swift does `import NitroFetch`.
//

#import <NitroFetch/NitroAutoPrefetcher.h>
#import <React/RCTLinkingManager.h>
