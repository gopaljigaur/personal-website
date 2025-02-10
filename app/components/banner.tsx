'use client'

import Image from "next/image";
import Link from "next/link";
import {StatusCard} from "./status";
import {usePathname} from "next/navigation";

export function MainBanner() {
    return (
        <span className="flex mb-14 dark:text-dark-text text-light-text gap-6 flex-col smplus:flex-row">
            <div className="flex-row flex-10 mb-4 smplus:mb-0">
                <Link href={"https://gopalji.me"} className="inline-flex flex-row gap-6">
                    <div className="w-[48px] relative min-w-[48px]">
                        <Image
                            alt='Gopalji Gaur'
                            height={48}
                            width={48}
                            priority={true}
                            src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'
                            className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"
                        />
                    </div>
                    <h1 className="text-4xl font-semibold relative tracking-tight mt-1">
                        Gopalji Gaur
                    </h1>
                </Link>
                <h2 className="text-2xl tracking-tight mt-6">
                    <p className="font-semibold bg-gradient-to-tr from-[var(--color-dark-secondary)] to-[var(--color-dark-primary)] inline-block text-transparent bg-clip-text leading-normal">
                        Machine Learning Engineer
                    </p>
                    <br></br>
                    based in
                    Freiburg, Germany.
                </h2>
            </div>
            {/*<div className="flex-1 content-center min-w-[128px] justify-items-start sm:justify-items-end mb-4 sm:mb-0">*/}
            {/*    <Image*/}
            {/*        alt='Gopalji Gaur'*/}
            {/*        height={128}*/}
            {/*        width={128}*/}
            {/*        priority={true}*/}
            {/*        src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'*/}
            {/*        className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"*/}
            {/*    />*/}
            {/*</div>*/}
            <StatusCard />
        </span>
    );
}

export function Banner() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);
    const bannerText = pathSegments[0] || 'gopaljigaur';
    return (
            <span className="inline-flex mb-16">
                <Link href={'/'}>
                    <div className="mr-4 w-[48px] relative self-center filter grayscale hover:grayscale-0 transition-all">
                        <Image
                            alt='Gopalji Gaur'
                            height={48}
                            width={48}
                            priority={true}
                            src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'
                            className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"
                        />
                    </div>
                </Link>
                <Link href={'/' + bannerText} className="flex items-center dark:text-dark-text text-light-text">
                    <h1 className="ml-1 text-2xl font-semibold relative tracking-tight">
                        <span className="mr-5">/</span>
                        {bannerText}
                    </h1>
                </Link>
            </span>
    );
}